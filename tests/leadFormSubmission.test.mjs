import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const API_URL = "https://api.example.test/api";
const PHONE = "+7 (999) 123-45-67";
const PAGE = "/regions/donetsk/";

function compile(relativePath) {
  const filename = new URL(relativePath, import.meta.url);
  return ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename.pathname,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
}

const feedbackCode = compile("../components/LeadForm/feedback.ts");
const componentCode = compile("../components/LeadForm/LeadFormClient.tsx");

function descendants(node) {
  if (Array.isArray(node)) return node.flatMap(descendants);
  if (!node || typeof node !== "object") return [];
  return [node, ...descendants(node.props?.children)];
}

function textContent(node) {
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (node && typeof node === "object") return textContent(node.props?.children);
  return typeof node === "string" || typeof node === "number" ? String(node) : "";
}

function response(status = 200, body = { success: true }) {
  return {
    ok: status >= 200 && status < 300,
    status,
    redirected: false,
    headers: new Headers({ "Content-Type": "application/json" }),
    json: async () => body,
  };
}

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

/**
 * Execute the real component, JSX event handlers and feedback helpers. Only the
 * hook scheduler, DOM-independent JSX and external effects are substituted.
 * This tests submission behavior, not React hydration or browser focus effects.
 */
function formHarness({ apiUrl = API_URL, variant = "inline", fetchImpl = async () => response() } = {}) {
  const slots = [];
  const requests = [];
  const goals = [];
  const timers = new Map();
  const focused = [];
  let cursor = 0;
  let timerId = 0;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], (value) => {
        slots[index] = typeof value === "function" ? value(slots[index]) : value;
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useId: () => "lead-test",
    useEffect() {},
    useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
  };
  const jsx = (type, props) => ({ type, props });
  const context = vm.createContext({
    URL, AbortController,
    // Operator env deliberately absent: public document metadata must not gate fetch.
    process: { env: { NODE_ENV: "production", NEXT_PUBLIC_API_URL: apiUrl } },
    window: {
      location: { pathname: PAGE },
      setTimeout(callback, delay) {
        const id = ++timerId;
        timers.set(id, { callback, delay });
        return id;
      },
      clearTimeout: (id) => timers.delete(id),
    },
    fetch: (url, options) => {
      requests.push({ url, options, body: JSON.parse(options.body) });
      return fetchImpl(url, options);
    },
  });
  const execute = (code, require) => {
    const exports = {};
    vm.runInContext(`(function (exports, require) { ${code}\n})`, context)(exports, require);
    return exports;
  };
  const feedback = execute(feedbackCode, () => { throw new Error("Unexpected feedback dependency"); });
  const modules = {
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "@/components/icons": { CheckIcon: () => null },
    "@/lib/analytics": { trackSiteGoal: (name, details) => goals.push({ name, details }) },
    "./feedback": feedback,
    "./LeadForm.module.scss": { default: {} },
  };
  const { LeadFormClient } = execute(componentCode, (name) => {
    assert.ok(Object.hasOwn(modules, name), `Unexpected component dependency: ${name}`);
    return modules[name];
  });
  const render = () => {
    cursor = 0;
    return LeadFormClient({
      regionName: "Донецк", phone: PHONE, consentVersion: "2026-09-27", variant,
      // Extra legacy prop reproduces the previously exported, blocking value.
      legalConfigured: false,
    });
  };
  const find = (predicate) => descendants(render()).find(predicate);
  const field = (name) => find((node) => node.props?.name === name);
  return {
    requests, goals, timers, focused, render, find, field,
    text: () => textContent(render()),
    change(name, value) {
      const control = field(name);
      assert.ok(control, `Missing field ${name}`);
      control.props.onChange({ target: { value, checked: value } });
    },
    fillValid() {
      this.change("name", "Тестовая заявка");
      this.change("phone", PHONE);
      this.change("consent", true);
    },
    submit() {
      const form = find((node) => node.type === "form");
      assert.ok(form, "Submission requires the form to remain visible");
      return form.props.onSubmit({
        preventDefault() {},
        currentTarget: { querySelector: (selector) => ({ focus: () => focused.push(selector) }) },
      });
    },
  };
}

for (const variant of ["inline", "modal"]) {
  test(`${variant} form submits without operator metadata and waits for API confirmation`, async () => {
    const transport = deferred();
    const body = deferred();
    const form = formHarness({ variant, fetchImpl: () => transport.promise });
    form.fillValid();
    const submitted = form.submit();

    assert.equal(form.requests.length, 1);
    const { url, options, body: payload } = form.requests[0];
    assert.equal(url, `${API_URL}/feedback`);
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(options.mode, "cors");
    assert.equal(payload.phone, "+79991234567");
    assert.equal(payload.personalDataConsent, true);
    assert.equal(payload.page, PAGE);
    assert.equal(payload.formPosition, variant);
    assert.equal(payload.consentVersion, "2026-09-27");
    assert.ok(Number.isFinite(Date.parse(payload.consentedAt)));
    assert.equal(form.find((node) => node.type === "fieldset").props.disabled, true);
    assert.match(form.text(), /Отправляем/);
    assert.doesNotMatch(form.text(), /Заявка отправлена/);

    await form.submit();
    assert.equal(form.requests.length, 1, "Repeated clicks cannot duplicate an in-flight request");
    transport.resolve({ ...response(), json: () => body.promise });
    await Promise.resolve();
    assert.doesNotMatch(form.text(), /Заявка отправлена/, "The JSON result must also be checked");
    body.resolve({ success: true });
    await submitted;

    assert.match(form.text(), /Заявка отправлена/);
    assert.equal(form.goals.filter((goal) => goal.name === "form_success").length, 1);
    assert.equal(form.timers.size, 0);
  });
}

test("missing consent or incomplete phone prevents an API request", async () => {
  for (const [name, value] of [["consent", false], ["phone", "+7 (999)"]]) {
    const form = formHarness();
    form.fillValid();
    form.change(name, value);
    await form.submit();
    assert.equal(form.requests.length, 0, name);
    assert.equal(form.field(name).props["aria-invalid"], true);
    assert.deepEqual(form.focused, [`[name="${name}"]`]);
    assert.doesNotMatch(form.text(), /Заявка отправлена/);
  }
});

test("missing API configuration keeps entered values and reports unavailability", async () => {
  const form = formHarness({ apiUrl: "" });
  form.fillValid();
  await form.submit();
  assert.equal(form.requests.length, 0);
  assert.match(form.text(), /отправка заявки недоступна/);
  assert.equal(form.field("phone").props.value, PHONE);
  assert.equal(form.field("consent").props.checked, true);
  assert.doesNotMatch(form.text(), /Заявка отправлена/);
});

const failureCases = [
  ["HTTP 502", async () => response(502), /Не удалось подтвердить отправку/],
  ["HTTP 429", async () => response(429), /Слишком много попыток/],
  ["network rejection", async () => { throw new TypeError("Failed to fetch"); }, /Не удалось подтвердить отправку/],
  ["JSON failure", async () => response(200, { success: false }), /Не удалось подтвердить отправку/],
  ["HTML fallback", async () => ({ ...response(), headers: new Headers({ "Content-Type": "text/html" }) }), /Не удалось подтвердить отправку/],
];

for (const [name, fetchImpl, message] of failureCases) {
  test(`${name} preserves values and never reports successful delivery`, async () => {
    const form = formHarness({ fetchImpl });
    form.fillValid();
    await form.submit();
    assert.equal(form.requests.length, 1);
    assert.match(form.text(), message);
    assert.doesNotMatch(form.text(), /Заявка отправлена/);
    assert.equal(form.field("name").props.value, "Тестовая заявка");
    assert.equal(form.field("phone").props.value, PHONE);
    assert.equal(form.field("consent").props.checked, true);
    assert.equal(form.find((node) => node.type === "fieldset").props.disabled, false);
    assert.equal(form.goals.some((goal) => goal.name === "form_success"), false);
    assert.equal(form.timers.size, 0);
  });
}
