import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const NOW = Date.parse("2026-09-27T12:00:00Z");

function eventTarget() {
  const handlers = new Map();
  return {
    addEventListener(type, callback, options) {
      handlers.set(type, [...(handlers.get(type) ?? []), { callback, once: options?.once }]);
    },
    removeEventListener(type, callback) {
      handlers.set(type, (handlers.get(type) ?? []).filter((record) => record.callback !== callback));
    },
    dispatchEvent(event) {
      for (const record of [...(handlers.get(event.type) ?? [])]) {
        record.callback(event);
        if (record.once) this.removeEventListener(event.type, record.callback);
      }
      return true;
    },
  };
}

function storage() {
  const values = new Map();
  return {
    get length() { return values.size; },
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    key: (index) => [...values.keys()][index] ?? null,
  };
}

function browser({ configured = true, readyState = "complete" } = {}) {
  let now = NOW;
  let sequence = 0;
  const timers = new Map();
  const idleCallbacks = new Map();
  const scripts = [];
  const requests = [];
  const calls = [];
  const cookies = new Map([["_ym_uid", "123"], ["essential", "yes"]]);
  const document = {
    ...eventTarget(), readyState, title: "ОКНО ЩИТ",
    get cookie() { return [...cookies].map(([key, value]) => `${key}=${value}`).join("; "); },
    set cookie(value) {
      const [key, content] = value.split(";", 1)[0].split("=");
      if (value.includes("Max-Age=0")) cookies.delete(key);
      else cookies.set(key, content);
    },
    getElementById: (id) => scripts.find((script) => script.id === id),
    createElement(tag) {
      assert.equal(tag, "script");
      return { remove() { const index = scripts.indexOf(this); if (index !== -1) scripts.splice(index, 1); } };
    },
    head: { appendChild(script) { scripts.push(script); requests.push(script.src); } },
  };
  const window = {
    ...eventTarget(),
    location: {
      hostname: "oknoshchit.site", origin: "https://oknoshchit.site", pathname: "/",
      href: "https://oknoshchit.site/?phone=secret#secret",
    },
    localStorage: storage(), sessionStorage: storage(),
    setTimeout(callback, delay) { const id = ++sequence; timers.set(id, { callback, delay }); return id; },
    clearTimeout: (id) => timers.delete(id),
    requestIdleCallback(callback) { const id = ++sequence; idleCallbacks.set(id, callback); return id; },
    cancelIdleCallback: (id) => idleCallbacks.delete(id),
  };
  class TestDate extends Date { static now() { return now; } }
  const context = vm.createContext({ window, document, Date: TestDate, Event, URL });
  const modules = new Map();
  function loadModule(path) {
    if (modules.has(path)) return modules.get(path);
    let source = readFileSync(`${path}.ts`, "utf8");
    if (path === "lib/analytics" && configured) source = source.replace('Number("000111222")', "123456789");
    const code = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const exports = {};
    modules.set(path, exports);
    const require = (name) => loadModule(name.replace("@/", ""));
    vm.runInContext(`(function (exports, require) { ${code}\n})`, context)(exports, require);
    return exports;
  }
  return {
    window, document, cookies, timers, idleCallbacks, scripts, requests, calls,
    consent: loadModule("lib/analytics-consent"), analytics: loadModule("lib/analytics"),
    flushIdle() {
      for (const [id, callback] of [...idleCallbacks]) { idleCallbacks.delete(id); callback(); }
    },
    finishScript() {
      window.ym = (...args) => calls.push(JSON.parse(JSON.stringify(args)));
      scripts.at(-1)?.onload?.();
    },
    setNow(value) { now = value; },
  };
}

test("consent validates version, explicit choice and a bounded expiry", () => {
  const { consent } = browser();
  const valid = { version: consent.ANALYTICS_CONSENT_VERSION, choice: "accepted", updatedAt: NOW, expiresAt: NOW + consent.ANALYTICS_CONSENT_MAX_AGE };
  const parse = (record, now = NOW) => consent.parseAnalyticsConsent(JSON.stringify(record), now);
  assert.equal(parse(valid).choice, "accepted");
  assert.equal(parse({ ...valid, choice: "declined" }).choice, "declined");
  for (const record of [null, [], "accepted", {}, { ...valid, choice: true }, { ...valid, version: 0 },
    { ...valid, updatedAt: NOW + 1 }, { ...valid, expiresAt: NOW }, { ...valid, expiresAt: valid.expiresAt + 1 },
  ]) assert.equal(parse(record), null);
  assert.equal(parse(valid, valid.expiresAt), null);
  assert.equal(consent.parseAnalyticsConsent("invalid", NOW), null);
  assert.equal(consent.getServerConsentSnapshot(), "pending");
});

test("blocked storage writes keep the choice in memory for this page", () => {
  const { consent, window } = browser();
  window.localStorage.setItem = () => { throw new Error("Blocked storage"); };
  consent.setAnalyticsConsent("accepted");
  assert.equal(consent.hasAnalyticsConsent(), true);
  consent.setAnalyticsConsent("declined");
  assert.equal(consent.hasAnalyticsConsent(), false);
});

test("same-tab changes, cross-tab removal and expiry update subscriptions", () => {
  const { consent, window, timers, setNow } = browser();
  const snapshots = [];
  const unsubscribe = consent.subscribeToAnalyticsConsent(() => snapshots.push(consent.getConsentSnapshot()));
  consent.setAnalyticsConsent("accepted");
  assert.deepEqual(snapshots, ["accepted"]);
  assert.equal(timers.size, 1);
  assert.ok([...timers.values()][0].delay <= 2_147_483_647);
  window.localStorage.removeItem(consent.ANALYTICS_CONSENT_KEY);
  window.dispatchEvent({ type: "storage", key: consent.ANALYTICS_CONSENT_KEY });
  assert.equal(snapshots.at(-1), null);
  assert.equal(timers.size, 0);
  consent.setAnalyticsConsent("accepted");
  setNow(NOW + consent.ANALYTICS_CONSENT_MAX_AGE);
  [...timers.values()][0].callback();
  assert.equal(snapshots.at(-1), null);
  unsubscribe();
  assert.equal(timers.size, 0);
});

test("unanswered, declined and placeholder consent never request Yandex", () => {
  for (const choice of [null, "declined"]) {
    const page = browser();
    if (choice) page.consent.setAnalyticsConsent(choice);
    page.analytics.startAnalytics(); page.flushIdle();
    assert.deepEqual(page.requests, []);
    assert.equal(page.window.ym, undefined);
  }
  const page = browser({ configured: false });
  page.consent.setAnalyticsConsent("accepted");
  page.analytics.startAnalytics(); page.flushIdle();
  assert.equal(page.analytics.isAnalyticsConfigured(), false);
  assert.deepEqual(page.requests, []);
});

test("accepted real counter waits for page load and idle before requesting its library", () => {
  const page = browser({ readyState: "loading" });
  page.consent.setAnalyticsConsent("accepted"); page.analytics.startAnalytics();
  assert.equal(page.idleCallbacks.size, 0);
  assert.deepEqual(page.requests, []);
  page.window.dispatchEvent({ type: "load" });
  assert.equal(page.idleCallbacks.size, 1);
  assert.deepEqual(page.requests, []);
  page.flushIdle();
  assert.equal(page.requests.length, 1);
  assert.equal(page.scripts[0].async, true);
  assert.equal(page.window.ym.a, undefined, "Do not queue initialization before the library loads");
});

test("revocation cancels pending work and prevents late initialization", () => {
  for (const readyState of ["loading", "complete"]) {
    const page = browser({ readyState });
    page.consent.setAnalyticsConsent("accepted");
    const cleanup = page.analytics.startAnalytics();
    page.consent.setAnalyticsConsent("declined"); cleanup();
    page.window.dispatchEvent({ type: "load" }); page.flushIdle();
    assert.deepEqual(page.requests, []);
  }
  const page = browser();
  page.consent.setAnalyticsConsent("accepted");
  const cleanup = page.analytics.startAnalytics(); page.flushIdle();
  const lateLoad = page.scripts[0].onload;
  page.consent.setAnalyticsConsent("declined"); cleanup();
  page.window.ym = (...args) => page.calls.push(args); lateLoad();
  assert.deepEqual(page.calls, []);
  assert.equal(page.scripts.length, 0);
});

test("page tracking omits queries, hashes and form recording, and deduplicates routes", () => {
  const page = browser();
  page.consent.setAnalyticsConsent("accepted"); page.analytics.startAnalytics();
  page.flushIdle(); page.finishScript();
  const init = page.calls.find((call) => call[1] === "init")[2];
  assert.equal(init.defer, true);
  for (const key of ["webvisor", "clickmap", "trackLinks"]) assert.equal(init[key], false);
  assert.equal(init.disableYtm, true);
  page.analytics.trackPageView("/");
  page.analytics.trackPageView("/contacts/"); page.analytics.trackPageView("/contacts/");
  assert.deepEqual(page.calls.filter((call) => call[1] === "hit").map((call) => call[2]), [
    "https://oknoshchit.site/", "https://oknoshchit.site/contacts/",
  ]);
  assert.equal(JSON.stringify(page.calls).includes("secret"), false);
});

test("withdrawal destroys the counter, removes analytics storage and blocks later goals", () => {
  const page = browser();
  page.window.localStorage.setItem("_ym_uid", "123");
  page.window.sessionStorage.setItem("_ym_retryReqs", "[]");
  page.window.localStorage.setItem("essential", "keep");
  page.consent.setAnalyticsConsent("accepted");
  const cleanup = page.analytics.startAnalytics(); page.flushIdle(); page.finishScript();
  page.analytics.trackSiteGoal("phone_click", { position: "header" });
  assert.equal(page.calls.at(-1)[1], "reachGoal");
  page.consent.setAnalyticsConsent("declined"); cleanup();
  assert.equal(page.calls.at(-1)[1], "destruct");
  const count = page.calls.length;
  page.analytics.trackSiteGoal("phone_click"); page.analytics.trackPageView("/company/");
  assert.equal(page.calls.length, count);
  assert.equal(page.cookies.has("_ym_uid"), false);
  assert.equal(page.cookies.get("essential"), "yes");
  assert.equal(page.window.localStorage.getItem("_ym_uid"), null);
  assert.equal(page.window.sessionStorage.getItem("_ym_retryReqs"), null);
  assert.equal(page.window.localStorage.getItem("essential"), "keep");
  assert.equal(page.consent.getConsentSnapshot(), "declined");
});
