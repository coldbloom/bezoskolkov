import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID, webcrypto } from "node:crypto";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const SESSION_KEY = "plenki_call_session_v1";
const TEST_PHONE = "+79991234567";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function loadModule(path, globals = {}) {
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, ...globals });
  return exports;
}

function browser({
  storage = new Map(), fetchImpl, crypto = webcrypto,
  apiUrl = "https://api.example/api/",
  search = "?utm_source=yandex&utm_medium=cpc&utm_campaign=donetsk&yclid=123",
} = {}) {
  const requests = [];
  const location = { pathname: "/regions/donetsk/", search, hash: "#estimate" };
  const globals = {
    URLSearchParams, crypto,
    process: { env: { NEXT_PUBLIC_API_URL: apiUrl, NODE_ENV: "production" } },
    window: { location }, document: { referrer: "https://yandex.ru/" },
    sessionStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
    },
    console: { info() {}, warn() {} },
    fetch: (url, options) => {
      requests.push({ url, ...options, payload: JSON.parse(options.body) });
      return fetchImpl ? fetchImpl() : Promise.resolve({ status: 202 });
    },
  };
  return { requests, location, globals, storage, api: loadModule("lib/callTracking.ts", globals) };
}

test("one tab session survives initialization and each phone click gets a new event ID", () => {
  const { api, requests, storage } = browser();
  api.initializeCallTracking();
  assert.equal(requests.length, 0, "Initialization never sends a click");
  api.trackPhoneClick("hero", TEST_PHONE);
  api.initializeCallTracking();
  api.trackPhoneClick("footer", TEST_PHONE);
  assert.equal(requests.length, 2);
  assert.match(requests[0].payload.sessionId, UUID_PATTERN);
  assert.equal(requests[0].payload.sessionId, requests[1].payload.sessionId);
  assert.notEqual(requests[0].payload.eventId, requests[1].payload.eventId);
  assert.ok(storage.has(SESSION_KEY));
  assert.equal(storage.has("medtax_call_session_v1"), false);
});

test("first-touch attribution survives navigation and a reload before the first click", () => {
  const storage = new Map();
  browser({ storage }).api.initializeCallTracking();
  const { api, requests, location } = browser({ storage, search: "?utm_source=other&yclid=456" });
  location.pathname = "/contacts/";
  api.initializeCallTracking();
  api.trackPhoneClick("contacts", TEST_PHONE);
  const event = requests[0].payload;
  assert.equal(event.page, "/contacts/");
  assert.equal(event.referrer, "https://yandex.ru/");
  assert.equal(event.utm.source, "yandex");
  assert.equal(event.utm.medium, "cpc");
  assert.equal(event.utm.campaign, "donetsk");
  assert.equal(event.yclid, "123");
});

test("a direct first visit is not replaced by UTM tags added during navigation", () => {
  const storage = new Map();
  browser({ storage, search: "" }).api.initializeCallTracking();
  const { api, requests } = browser({ storage });
  api.trackPhoneClick("footer", TEST_PHONE);
  assert.deepEqual(requests[0].payload.utm, {});
  assert.equal(requests[0].payload.yclid, undefined);
});

test("stored attribution is validated and cannot replace the actual click fields", () => {
  const storage = new Map([[SESSION_KEY, JSON.stringify({
    sessionId: randomUUID(), eventId: "wrong", trackingId: "wrong", phone: "wrong",
    page: "/wrong", utm: { source: {}, medium: "cpc\u0000", campaign: "a".repeat(300), arbitrary: "wrong" },
    referrer: "javascript:alert(1)", yclid: { bad: true },
  })]]);
  const { api, requests } = browser({ storage });
  api.trackPhoneClick("hero", TEST_PHONE);
  const event = requests[0].payload;
  assert.equal(event.page, "/regions/donetsk/");
  assert.equal(event.phone, TEST_PHONE);
  assert.equal(event.trackingId, "hero");
  assert.match(event.eventId, UUID_PATTERN);
  assert.deepEqual(event.utm, { medium: "cpc", campaign: "a".repeat(255) });
  assert.equal(event.referrer, undefined);
  assert.equal(event.yclid, undefined);
});

test("invalid stored JSON or session IDs start a fresh session", () => {
  for (const stored of ["{broken", JSON.stringify({ sessionId: "not-a-uuid" })]) {
    const { api, requests } = browser({ storage: new Map([[SESSION_KEY, stored]]) });
    api.initializeCallTracking();
    api.trackPhoneClick("hero", TEST_PHONE);
    assert.match(requests[0].payload.sessionId, UUID_PATTERN);
    assert.equal(requests[0].payload.utm.source, "yandex");
  }
});

test("a pending request returns immediately and uses JSON text/plain with keepalive", () => {
  const { api, requests } = browser({ fetchImpl: () => new Promise(() => {}) });
  assert.equal(api.trackPhoneClick("hero", TEST_PHONE), undefined);
  assert.equal(requests[0].url, "https://api.example/api/call-clicks");
  assert.equal(requests[0].method, "POST");
  assert.equal(requests[0].keepalive, true);
  assert.equal(requests[0].credentials, "omit");
  assert.equal(requests[0].headers["Content-Type"], "text/plain;charset=UTF-8");
  assert.equal(requests[0].payload.page, "/regions/donetsk/");
  assert.match(requests[0].payload.clientTimestamp, /^\d{4}-\d{2}-\d{2}T.*Z$/);
});

test("without an API URL the phone action produces no tracking request", () => {
  for (const apiUrl of ["", "   "]) {
    const { api, requests } = browser({ apiUrl });
    assert.equal(api.trackPhoneClick("hero", TEST_PHONE), undefined);
    assert.deepEqual(requests, []);
  }
});

test("HTTP errors, offline and synchronous fetch failures never escape the tracker", async () => {
  for (const fetchImpl of [
    () => Promise.resolve({ status: 500 }),
    () => Promise.reject(new Error("offline")),
    () => { throw new Error("fetch unavailable"); },
  ]) {
    const { api } = browser({ fetchImpl });
    assert.doesNotThrow(() => api.trackPhoneClick("hero", TEST_PHONE));
  }
  await new Promise(setImmediate);
});

test("blocked sessionStorage keeps an in-memory session and UUID fallback works", () => {
  const { globals, requests } = browser({
    crypto: { getRandomValues: (bytes) => webcrypto.getRandomValues(bytes) },
  });
  globals.sessionStorage = {
    getItem() { throw new Error("storage disabled"); },
    setItem() { throw new Error("storage disabled"); },
  };
  const api = loadModule("lib/callTracking.ts", globals);
  api.initializeCallTracking();
  api.trackPhoneClick("hero", TEST_PHONE);
  api.initializeCallTracking();
  api.trackPhoneClick("footer", TEST_PHONE);
  assert.equal(requests[0].payload.sessionId, requests[1].payload.sessionId);
  assert.match(requests[0].payload.eventId, UUID_PATTERN);
});

test("capture delegation covers nested, late-added and unlabelled links and cleans up on remount", () => {
  const listeners = new Set();
  const clicks = [];
  let initializeCount = 0;
  let runEffect;
  let link = null;
  class Element {
    closest(selector) {
      assert.equal(selector, 'a[href^="tel:"]');
      return link;
    }
  }
  const { PhoneClickTracking } = loadModule("components/PhoneClickTracking/PhoneClickTracking.tsx", {
    Element,
    require: (name) => {
      if (name === "react") return { useEffect: (effect) => { runEffect = effect; } };
      assert.equal(name, "@/lib/callTracking");
      return {
        initializeCallTracking() { initializeCount++; },
        trackPhoneClick: (...args) => clicks.push(args),
      };
    },
    document: {
      addEventListener: (name, listener, capture) => {
        assert.equal(name, "click");
        assert.equal(capture, true);
        listeners.add(listener);
      },
      removeEventListener: (name, listener, capture) => {
        assert.equal(name, "click");
        assert.equal(capture, true);
        listeners.delete(listener);
      },
    },
  });
  PhoneClickTracking();
  const cleanup = runEffect();
  cleanup();
  assert.equal(listeners.size, 0);
  const cleanupAgain = runEffect();
  assert.equal(listeners.size, 1);
  assert.equal(initializeCount, 2);

  const dispatch = (target = new Element()) => {
    const event = { target, preventDefault: () => assert.fail("Phone action was cancelled") };
    for (const listener of listeners) listener(event);
  };
  dispatch(null);
  dispatch(); // Not a phone link.
  assert.deepEqual(clicks, []);
  link = {
    dataset: { callTrackingId: "contact_modal" },
    getAttribute: (name) => { assert.equal(name, "href"); return `tel:${TEST_PHONE}`; },
  };
  dispatch();
  link.dataset = {};
  dispatch();
  link.getAttribute = () => "tel:";
  dispatch();
  assert.deepEqual(clicks, [["contact_modal", TEST_PHONE], ["unlabelled", TEST_PHONE]]);
  cleanupAgain();
  assert.equal(listeners.size, 0);
});
