import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../components/LeadForm/feedback.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const context = { exports: {}, URL };
vm.runInNewContext(compiled, context);
const { createLeadPayload, formatLeadPhone, getFeedbackEndpoint, validateLead } = context.exports;
const placement = { page: "/regions/rostov-na-donu/", formPosition: "inline" };
const valid = { name: "", phone: "+7 (989) 505-27-85", object: "", consent: true };

test("a phone number and explicit consent are required; optional fields may remain empty", () => {
  assert.equal(Object.keys(validateLead(valid)).length, 0);
  assert.ok(validateLead({ ...valid, consent: false }).consent);
  assert.ok(validateLead({ ...valid, phone: "+7 (989)" }).phone);
  assert.ok(validateLead({ ...valid, phone: "+1 (989) 505-27-85" }).phone);
  assert.throws(() => createLeadPayload({ ...valid, consent: false }, "Юг России", "2026-09-27", placement));
});

test("unsupported field data cannot reach the submission payload", () => {
  assert.ok(validateLead({ ...valid, name: "a".repeat(81) }).name);
  assert.ok(validateLead({ ...valid, object: "arbitrary text" }).object);
  assert.throws(() => createLeadPayload({ ...valid, object: "arbitrary text" }, "Юг России", "2026-09-27", placement));
});

test("the API receives contact data, page/form placement and the consent version/timestamp", () => {
  const payload = createLeadPayload({ ...valid, name: "  Иван  ", object: "Квартира", unexpected: "private" }, "Ростовская область", "2026-09-27", placement);
  assert.deepEqual(Object.keys(payload).sort(), ["name", "phone", "message", "personalDataConsent", "consentVersion", "consentedAt", "page", "formPosition"].sort());
  assert.equal(payload.name, "Иван");
  assert.equal(payload.page, placement.page);
  assert.equal(payload.formPosition, "inline");
  assert.equal(payload.phone, "+79895052785");
  assert.equal(payload.personalDataConsent, true);
  assert.equal(payload.consentVersion, "2026-09-27", placement);
  assert.ok(Number.isFinite(Date.parse(payload.consentedAt)));
  assert.match(payload.message, /ОКНО ЩИТ.*Ростовская область.*Квартира/);
});

test("missing, insecure, credential-bearing or malformed API configuration stays disabled", () => {
  for (const base of [undefined, "", "https://", "http://example.com/api", "//example.com/api", "https://user:secret@example.com/api", "https://example.com/api?token=secret", "https://example.com/api#fragment", "javascript:alert(1)"]) {
    assert.equal(getFeedbackEndpoint(base), null, String(base));
  }
  assert.equal(getFeedbackEndpoint("https://api.example.com/api/"), "https://api.example.com/api/feedback");
  assert.equal(getFeedbackEndpoint("/api"), "/api/feedback");
  assert.equal(getFeedbackEndpoint("http://localhost:3235/api"), "http://localhost:3235/api/feedback");
});

test("Russian phone entry accepts pasted +7 and 8 prefixes and limits extra digits", () => {
  assert.equal(formatLeadPhone("+7 989 505 27 85"), "+7 (989) 505-27-85");
  assert.equal(formatLeadPhone("89895052785"), "+7 (989) 505-27-85");
  assert.equal(formatLeadPhone("9895052785123"), "+7 (989) 505-27-85");
  assert.equal(formatLeadPhone(""), "");
});


test("modal and inline forms send their current path without query/hash", () => {
  for (const formPosition of ["inline", "modal"]) {
    for (const page of ["/", "/regions/krasnodar/", "/contacts/", "/company/"]) {
      const payload = createLeadPayload(valid, "Юг России", "2026-09-27", { page: `${page}?token=private#fragment`, formPosition });
      assert.equal(payload.page, page);
      assert.equal(payload.formPosition, formPosition);
      assert.equal(payload.name, "");
      assert.equal(JSON.stringify(payload).includes("private"), false);
    }
  }
  assert.throws(() => createLeadPayload(valid, "Юг России", "2026-09-27", { ...placement, page: "https://other.test/" }));
});
