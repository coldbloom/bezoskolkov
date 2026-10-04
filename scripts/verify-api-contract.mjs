import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { once } from "node:events";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

// The server repository is explicit; no production URL, credentials or .env is read.
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const testOrigin = "https://oknoshield.test";
const testPhone = "+79991234567";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function serverDirectory(args) {
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) return null;
  if (args.length === 1 && !args[0].startsWith("-")) return path.resolve(args[0]);
  if (args.length === 2 && args[0] === "--server") return path.resolve(args[1]);
  throw new Error("Usage: node scripts/verify-api-contract.mjs --server /absolute/path/to/conditioners-server");
}

/** Execute actual frontend modules with an isolated environment and browser APIs. */
function frontendModules(env, globals = {}) {
  const cache = new Map();
  const context = vm.createContext({ URL, URLSearchParams, process: { env }, ...globals });
  function load(relativePath) {
    let filename = path.resolve(projectRoot, relativePath);
    if (!path.extname(filename)) {
      filename = [".ts", ".mjs"].map((extension) => filename + extension).find(existsSync);
    }
    assert.ok(filename && filename.startsWith(projectRoot), `Unsupported frontend module: ${relativePath}`);
    if (cache.has(filename)) return cache.get(filename);
    const code = ts.transpileModule(readFileSync(filename, "utf8"), {
      // TypeScript preserves native .mjs exports even with module=CommonJS.
      fileName: filename.replace(/\.mjs$/, ".ts"),
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, allowJs: true },
    }).outputText;
    const exports = {};
    cache.set(filename, exports);
    const require = (specifier) => {
      if (specifier.startsWith("@/")) return load(specifier.slice(2));
      assert.ok(specifier.startsWith("."), `Unexpected frontend dependency: ${specifier}`);
      return load(path.relative(projectRoot, path.resolve(path.dirname(filename), specifier)));
    };
    vm.runInContext(`(function (exports, require) { ${code}\n})`, context, { filename })(exports, require);
    return exports;
  }
  return load;
}

/** Static page paths plus region slugs from the same module used by the site. */
function sitePages(regions) {
  const pages = new Map();
  const defaultRegion = regions.find((region) => region.slug === "yug-rossii") ?? regions[0];
  assert.ok(defaultRegion, "No regions configured");
  function visit(directory, segments = []) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith("[") && !entry.name.startsWith("_")) {
        visit(path.join(directory, entry.name), [...segments, entry.name]);
      } else if (entry.isFile() && entry.name === "page.tsx") {
        const urlSegments = segments.filter((segment) => !segment.startsWith("(") && !segment.startsWith("@"));
        const pathname = urlSegments.length ? `/${urlSegments.join("/")}/` : "/";
        pages.set(pathname, defaultRegion.name);
      }
    }
  }
  visit(path.join(projectRoot, "app"));
  for (const region of regions) pages.set(`/regions/${region.slug}/`, region.name);
  return [...pages].sort(([left], [right]) => left.localeCompare(right));
}

function withEnvironment(env, callback) {
  const previous = new Map(Object.keys(env).map((key) => [key, process.env[key]]));
  Object.assign(process.env, env);
  try {
    return callback();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

async function main() {
  const serverRoot = serverDirectory(process.argv.slice(2));
  if (!serverRoot) {
    console.log("Usage: node scripts/verify-api-contract.mjs --server /absolute/path/to/conditioners-server");
    return;
  }
  const serverRequire = createRequire(path.join(serverRoot, "package.json"));
  // Load only router factories. Never import server/src/index.ts or Telegram clients.
  const compiler = serverRequire("ts-node").register({ project: path.join(serverRoot, "tsconfig.json") });
  const express = serverRequire("express");
  const { createFeedbackRouter } = serverRequire(path.join(serverRoot, "src/feedback/router.ts"));
  const { createCallClicksRouter } = serverRequire(path.join(serverRoot, "src/call-clicks/router.ts"));
  const env = {
    NODE_ENV: "production",
    OKNOSHIELD_URL: testOrigin,
    MEDTAXI_URL: "https://medtaxi.test",
    FREEZE_MASTER: "https://freeze.test",
    PARTNER_URL: "https://partner.test",
    CALL_CLICK_ALLOWED_ORIGINS: "",
    FREEZE_MASTER_TELEGRAM_TOKEN: "fake-common-token",
    FREEZE_MASTER_CHAT_ID: "fake-common-chat",
    PARTNER_TELEGRAM_TOKEN: "fake-partner-token",
    PARTNER_TELEGRAM_GROUP_CHAT_ID: "fake-partner-chat",
  };
  const notifications = [];
  const acceptedCalls = [];
  const app = express();
  app.use("/api/feedback", createFeedbackRouter({
    env,
    sendMessage: async (notification) => { notifications.push(notification); },
  }));
  app.use("/api/call-clicks", withEnvironment(env, () => createCallClicksRouter({
    onAccepted: (event) => { acceptedCalls.push(event); },
  })));

  let server;
  const originalLog = console.log;
  // Keep this check's output concise without hiding unexpected diagnostics.
  console.log = (...args) => {
    if (typeof args[0] === "string" && /^(\[feedback\] delivered|\[call-click\])/.test(args[0])) return;
    originalLog(...args);
  };
  try {
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const apiBase = `http://127.0.0.1:${server.address().port}/api`;
    const allowedOrigin = new URL(apiBase).origin;
    const localFetch = (url, options = {}) => {
      assert.equal(new URL(url).origin, allowedOrigin, "Contract checks must only request the local test server");
      return fetch(url, { ...options, redirect: "error", signal: AbortSignal.timeout(5000) });
    };
    const frontendEnv = { NODE_ENV: "production", NEXT_PUBLIC_API_URL: apiBase, DEFAULT_PHONE: testPhone };
    const load = frontendModules(frontendEnv);
    const { createLeadPayload, getFeedbackEndpoint, OBJECT_TYPES } = load("components/LeadForm/feedback.ts");
    const { regions } = load("lib/regions.ts");
    const { LEGAL_VERSION } = load("lib/legal.ts");
    const pages = sitePages(regions);
    const feedbackUrl = getFeedbackEndpoint(apiBase);
    assert.equal(feedbackUrl, `${apiBase}/feedback`);

    const preflight = await localFetch(feedbackUrl, {
      method: "OPTIONS",
      headers: {
        Origin: testOrigin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });
    assert.equal(preflight.status, 204, "JSON feedback preflight");
    assert.equal(preflight.headers.get("access-control-allow-origin"), testOrigin);
    assert.match(preflight.headers.get("access-control-allow-methods") ?? "", /POST/);
    assert.match(preflight.headers.get("access-control-allow-headers") ?? "", /content-type/i);

    for (const [page, regionName] of pages) {
      for (const formPosition of ["inline", "modal"]) {
        for (const name of ["", "Контрактный тест"]) {
          const payload = createLeadPayload({
            name, phone: "+7 (999) 123-45-67", object: name ? OBJECT_TYPES[0] : "", consent: true,
          }, regionName, LEGAL_VERSION, { page: `${page}?ignored=1#estimate`, formPosition });
          const count = notifications.length;
          const response = await localFetch(feedbackUrl, {
            method: "POST", headers: { Origin: testOrigin, "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const result = await response.json();
          assert.equal(response.status, 200, `${page} ${formPosition}: ${JSON.stringify(result)}`);
          assert.equal(result.success, true);
          assert.equal(response.headers.get("access-control-allow-origin"), testOrigin);
          assert.equal(notifications.length, count + 1);
          const sent = notifications.at(-1);
          assert.equal(sent.telegramToken, env.FREEZE_MASTER_TELEGRAM_TOKEN);
          assert.equal(sent.telegramChatId, env.FREEZE_MASTER_CHAT_ID);
          assert.equal(sent.serviceFrom, testOrigin);
          assert.equal(sent.formData.name, name);
          assert.equal(sent.formData.phone, testPhone);
          assert.equal(sent.formData.message, payload.message);
          assert.ok(sent.formData.message.includes(regionName));
          assert.equal(sent.formData.page, page);
          assert.equal(sent.formData.formPosition, formPosition);
          assert.equal(sent.formData.personalDataConsent, true);
          assert.equal(sent.formData.consentVersion, LEGAL_VERSION);
          assert.equal(sent.formData.consentedAt, payload.consentedAt);
          assert.ok(Number.isFinite(Date.parse(sent.formData.receivedAt)));
        }
      }
    }

    const storage = new Map();
    const requests = [];
    const referrer = "https://yandex.test/search/";
    const initialUtm = { source: "yandex", medium: "cpc", campaign: "contract", content: "hero", term: "windows" };
    function browser(search) {
      const location = new URL(`${testOrigin}/${search}`);
      const loadBrowser = frontendModules(frontendEnv, {
        crypto: webcrypto,
        window: { location }, document: { referrer },
        sessionStorage: {
          getItem: (key) => storage.get(key) ?? null,
          setItem: (key, value) => storage.set(key, value),
        },
        fetch: (url, options) => {
          const request = { url, options, payload: JSON.parse(options.body) };
          request.pending = localFetch(url, {
            ...options,
            headers: { ...options.headers, Origin: testOrigin },
          });
          requests.push(request);
          return request.pending;
        },
      });
      return { location, tracker: loadBrowser("lib/callTracking.ts") };
    }
    const pageBrowser = browser("?utm_source=yandex&utm_medium=cpc&utm_campaign=contract&utm_content=hero&utm_term=windows&yclid=123456");
    pageBrowser.tracker.initializeCallTracking();
    pageBrowser.tracker.initializeCallTracking();
    assert.equal(requests.length, 0, "Session initialization must not send a click");
    for (const [page] of pages) {
      pageBrowser.location.href = `${testOrigin}${page}?utm_source=changed#contact`;
      assert.equal(pageBrowser.tracker.trackPhoneClick("footer", testPhone), undefined);
    }
    // A new module context models a reload; first-touch sessionStorage must survive it.
    const reloadedBrowser = browser("?utm_source=reloaded&yclid=999");
    reloadedBrowser.location.pathname = "/contacts/";
    reloadedBrowser.tracker.initializeCallTracking();
    reloadedBrowser.tracker.trackPhoneClick("contacts", testPhone);
    assert.equal(requests.length, pages.length + 1);

    for (const request of requests) {
      assert.equal(request.url, `${apiBase}/call-clicks`);
      assert.equal(request.options.method, "POST");
      assert.equal(request.options.keepalive, true);
      assert.equal(request.options.credentials, "omit");
      assert.equal(request.options.headers["Content-Type"], "text/plain;charset=UTF-8");
      const response = await request.pending;
      const result = await response.json();
      assert.equal(response.status, 202, `${request.payload.page}: ${JSON.stringify(result)}`);
      assert.equal(response.headers.get("access-control-allow-origin"), testOrigin);
      assert.equal(result.accepted, true);
      assert.equal(result.eventId, request.payload.eventId);
    }
    // onAccepted runs in a microtask after the response has been formed.
    await new Promise(setImmediate);
    assert.equal(acceptedCalls.length, requests.length);
    const byEventId = new Map(acceptedCalls.map((event) => [event.eventId, event]));
    assert.equal(byEventId.size, requests.length, "Each click has a distinct event ID");
    assert.equal(new Set(acceptedCalls.map((event) => event.sessionId)).size, 1, "Session survives navigation and reload");
    for (const request of requests) {
      const event = byEventId.get(request.payload.eventId);
      assert.ok(event);
      assert.match(event.eventId, uuidPattern);
      assert.match(event.sessionId, uuidPattern);
      assert.equal(event.origin, testOrigin);
      assert.equal(event.page, request.payload.page);
      assert.equal(event.phone, testPhone);
      assert.equal(event.trackingId, request.payload.trackingId);
      assert.equal(event.referrer, referrer);
      assert.deepEqual(event.utm, initialUtm);
      assert.equal(event.yclid, "123456");
      assert.equal(event.clientTimestamp, request.payload.clientTimestamp);
      assert.ok(Number.isFinite(Date.parse(event.receivedAt)));
    }
    originalLog(`API contract OK: ${pages.length} page paths, ${notifications.length} feedback submissions, ${acceptedCalls.length} phone clicks; CORS, destinations and first-touch session verified. Local routers only; no Telegram messages sent.`);
  } finally {
    console.log = originalLog;
    compiler.enabled(false);
    if (server?.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
        server.closeAllConnections();
      });
    }
  }
}

main().catch((error) => {
  console.error(`API contract failed: ${error.message}`);
  process.exitCode = 1;
});
