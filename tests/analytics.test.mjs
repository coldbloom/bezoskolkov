import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const COUNTER_ID = 123456789;
const NOW = Date.parse("2026-10-04T12:00:00Z");
const SITE_ORIGIN = "https://site.example";
const SCRIPT_ID = "oknoshield-yandex-metrika-script";

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
    },
  };
}

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function browser(options = {}) {
  const { pathname = "/", readyState = "complete", idleCallback = true } = options;
  const counterValue = Object.hasOwn(options, "counterValue") ? options.counterValue : String(COUNTER_ID);
  let sequence = 0;
  const timers = new Map();
  const idleCallbacks = new Map();
  const scripts = [];
  const requests = [];
  const document = {
    ...eventTarget(),
    readyState,
    title: "ОКНО ЩИТ",
    referrer: "https://referrer.example/search",
    scripts,
    getElementById: (id) => scripts.find((script) => script.id === id) ?? null,
    createElement(tag) {
      assert.equal(tag, "script");
      return {};
    },
    head: { appendChild(script) { scripts.push(script); requests.push(script.src); } },
  };
  const window = {
    ...eventTarget(),
    location: new URL(pathname, SITE_ORIGIN),
    localStorage: storage(),
    sessionStorage: storage(),
    setTimeout(callback, delay) {
      const id = ++sequence;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
  };
  if (idleCallback) {
    window.requestIdleCallback = (callback, options) => {
      const id = ++sequence;
      idleCallbacks.set(id, { callback, options });
      return id;
    };
  }
  class TestDate extends Date { static now() { return NOW; } }
  const context = vm.createContext({
    window, document, Date: TestDate, Event, URL,
    process: { env: { NEXT_PUBLIC_YANDEX_METRIKA_ID: counterValue } },
  });
  const modules = new Map();
  function loadModule(path) {
    if (modules.has(path)) return modules.get(path);
    const source = readFileSync(`${path}.ts`, "utf8");
    const code = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const exports = {};
    modules.set(path, exports);
    const require = (name) => {
      assert.ok(name.startsWith("@/"), `Unexpected dependency: ${name}`);
      return loadModule(name.replace("@/", ""));
    };
    vm.runInContext(`(function (exports, require) { ${code}\n})`, context)(exports, require);
    return exports;
  }
  const analytics = loadModule("lib/analytics");
  const { getYandexMetrikaScript } = loadModule("lib/yandex-metrika");
  return {
    window, document, timers, idleCallbacks, scripts, requests, analytics,
    getYandexMetrikaScript,
    bootstrap(counterId = analytics.YANDEX_METRIKA_ID) {
      vm.runInContext(getYandexMetrikaScript(counterId), context);
    },
    commands() {
      return JSON.parse(JSON.stringify(Array.from(window.ym?.a ?? [], (args) => Array.from(args))));
    },
    navigate(pathname) {
      window.location.href = new URL(pathname, SITE_ORIGIN).href;
      analytics.trackPageView(window.location.pathname);
    },
    flushIdle() {
      for (const [id, { callback }] of [...idleCallbacks]) {
        idleCallbacks.delete(id);
        callback();
      }
    },
    flushTimers() {
      for (const [id, { callback }] of [...timers]) {
        timers.delete(id);
        callback();
      }
    },
  };
}

test("the counter comes from the environment and invalid IDs cannot initialize analytics", () => {
  const page = browser({ counterValue: "987654321" });
  assert.equal(page.analytics.YANDEX_METRIKA_ID, 987654321);
  assert.equal(page.analytics.isAnalyticsConfigured(), true);
  page.bootstrap();
  assert.equal(page.commands()[0][0], 987654321);
  page.flushIdle();
  assert.deepEqual(page.requests, ["https://mc.yandex.ru/metrika/tag.js?id=987654321"]);

  for (const counterValue of [undefined, "", "0", "-1", "1.5", "0x12", "invalid", "9007199254740992"]) {
    const invalid = browser({ counterValue });
    assert.equal(invalid.analytics.isAnalyticsConfigured(), false, String(counterValue));
    invalid.analytics.trackPageView("/");
    invalid.analytics.trackSiteGoal("phone_click");
    assert.deepEqual(invalid.requests, []);
    assert.equal(invalid.window.ym, undefined);
  }
});

test("the inline script rejects invalid numbers before producing executable code", () => {
  const { getYandexMetrikaScript } = browser();
  for (const counterId of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "1;alert(1)"]) {
    assert.throws(() => getYandexMetrikaScript(counterId), { name: "RangeError" });
  }
});

test("initialization immediately queues the requested options and schedules the library once", () => {
  const page = browser({ readyState: "loading", pathname: "/?campaign=autumn#details" });
  page.bootstrap();
  const commands = page.commands();
  assert.equal(commands.length, 1);
  assert.deepEqual(commands[0], [COUNTER_ID, "init", {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: "dataLayer",
    referrer: page.document.referrer,
    url: page.window.location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  }]);
  assert.equal(page.window.ym.l, NOW);
  assert.equal(page.window.__oknoshieldMetrika.counterId, COUNTER_ID);
  assert.deepEqual(page.requests, []);
  assert.equal(page.idleCallbacks.size, 0);

  page.bootstrap();
  assert.equal(page.commands().filter((call) => call[1] === "init").length, 1);
  page.document.readyState = "complete";
  page.window.dispatchEvent({ type: "load" });
  assert.equal(page.idleCallbacks.size, 1);
  page.flushIdle();
  assert.deepEqual(page.requests, [`https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}`]);
  assert.equal(page.scripts[0].id, SCRIPT_ID);
  assert.equal(page.scripts[0].async, true);
  page.bootstrap();
  page.flushIdle();
  assert.equal(page.requests.length, 1);
});

test("legacy declined consent and unavailable storage do not gate initialization or goals", () => {
  for (const storageBlocked of [false, true]) {
    const page = browser();
    page.window.localStorage.setItem("oknoshield:analytics-consent", JSON.stringify({
      version: 1, choice: "declined", updatedAt: NOW, expiresAt: NOW + 86400000,
    }));
    if (storageBlocked) {
      Object.defineProperty(page.window, "localStorage", {
        get() { throw new Error("Browser storage is blocked"); },
      });
    }
    page.bootstrap();
    page.analytics.trackSiteGoal("phone_click", { position: "header" });
    assert.deepEqual(page.requests, []);
    assert.equal(page.commands()[0][1], "init");
    assert.deepEqual(page.commands().at(-1), [COUNTER_ID, "reachGoal", "phone_click", {
      position: "header", page: "/",
    }]);
    page.flushIdle();
    assert.equal(page.requests.length, 1);
  }
});

test("a script already present by ID or URL is not loaded a second time", () => {
  for (const script of [
    { id: SCRIPT_ID, src: "https://mc.yandex.ru/metrika/tag.js" },
    { id: "existing-metrika", src: `https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}` },
  ]) {
    const page = browser();
    page.scripts.push(script);
    page.bootstrap();
    page.flushIdle();
    assert.deepEqual(page.requests, []);
    assert.equal(page.commands().filter((call) => call[1] === "init").length, 1);
  }
});

test("the initial page is counted by init and SPA routes are counted once while the script is queued", () => {
  const page = browser({ pathname: "/?campaign=autumn#details" });
  page.bootstrap();
  page.analytics.trackPageView("/");
  page.navigate("/contacts");
  page.navigate("/contacts/");
  page.navigate("/company/");
  page.navigate("/contacts/");
  const hits = page.commands().filter((call) => call[1] === "hit");
  assert.deepEqual(hits.map((call) => new URL(call[2]).pathname.replace(/\/$/, "")), [
    "/contacts", "/company", "/contacts",
  ]);
  assert.equal(hits[0][3].title, page.document.title);
  assert.equal(hits[0][3].referer, `${SITE_ORIGIN}/?campaign=autumn#details`);
  assert.equal(hits[1][3].referer, `${SITE_ORIGIN}/contacts`);
  assert.equal(page.commands().filter((call) => call[1] === "init").length, 1);
  assert.deepEqual(page.requests, []);
  page.flushIdle();
  assert.equal(page.requests.length, 1);
});

test("page views and goals are ignored until the configured counter has initialized", () => {
  const page = browser();
  page.analytics.trackPageView("/contacts/");
  page.analytics.trackSiteGoal("phone_click");
  assert.deepEqual(page.commands(), []);

  page.bootstrap(COUNTER_ID + 1);
  const count = page.commands().length;
  page.analytics.trackPageView("/contacts/");
  page.analytics.trackSiteGoal("phone_click");
  assert.equal(page.commands().length, count, "Do not send events to a different counter");
});

test("home, region and inner pages queue goals immediately but wait for load and idle to fetch", () => {
  for (const pathname of ["/", "/regions/donetsk", "/regions/donetsk/", "/contacts/"]) {
    const page = browser({ pathname, readyState: "loading" });
    page.bootstrap();
    page.analytics.trackSiteGoal("phone_click", { position: "hero" });
    assert.deepEqual(page.commands().map((call) => call[1]), ["init", "reachGoal"]);
    assert.deepEqual(page.requests, []);
    assert.equal(page.idleCallbacks.size, 0);

    page.document.readyState = "complete";
    page.window.dispatchEvent({ type: "load" });
    assert.equal(page.idleCallbacks.size, 1);
    assert.equal([...page.idleCallbacks.values()][0].options.timeout, 2000);
    assert.deepEqual(page.requests, []);
    page.flushIdle();
    page.window.dispatchEvent({ type: "load" });
    page.flushIdle();
    assert.equal(page.requests.length, 1);
  }
});

test("an already loaded homepage schedules immediately and supports browsers without idle callbacks", () => {
  for (const idleCallback of [true, false]) {
    const page = browser({ idleCallback });
    page.bootstrap();
    assert.equal(page.commands()[0][1], "init");
    assert.deepEqual(page.requests, []);
    if (idleCallback) {
      assert.equal(page.idleCallbacks.size, 1);
      page.flushIdle();
    } else {
      assert.equal(page.timers.size, 1);
      assert.equal([...page.timers.values()][0].delay, 0);
      page.flushTimers();
    }
    assert.equal(page.requests.length, 1);
  }
});

test("navigation before page load retains the original visit and queues the new route and goal", () => {
  const page = browser({ readyState: "loading", pathname: "/?campaign=autumn" });
  page.bootstrap();
  page.analytics.trackPageView("/");
  page.navigate("/contacts/");
  page.analytics.trackSiteGoal("phone_click", { position: "contacts" });
  assert.deepEqual(page.requests, []);
  assert.deepEqual(page.commands().map((call) => call[1]), ["init", "hit", "reachGoal"]);
  assert.equal(page.commands()[0][2].url, `${SITE_ORIGIN}/?campaign=autumn`);
  assert.equal(page.commands()[1][2], `${SITE_ORIGIN}/contacts/`);
  assert.equal(page.commands()[1][3].referer, `${SITE_ORIGIN}/?campaign=autumn`);
  assert.equal(page.commands()[2][3].page, "/contacts/");

  page.document.readyState = "complete";
  page.window.dispatchEvent({ type: "load" });
  page.flushIdle();
  assert.equal(page.requests.length, 1);
  assert.deepEqual(page.commands().map((call) => call[1]), ["init", "hit", "reachGoal"]);
});
