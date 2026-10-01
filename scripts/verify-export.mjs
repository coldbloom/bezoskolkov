import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(fileURLToPath(new URL("../", import.meta.url)));
const { SITE_URL, SITE_DOMAIN } = await import("../lib/site-url.mjs");

const output = new URL("../out/", import.meta.url);

async function exportedFile(path) {
  return readFile(new URL(path, output), "utf8");
}

function decodeHtml(value) {
  const entities = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };

  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
    if (code.startsWith("#")) {
      const hex = code[1].toLowerCase() === "x";
      return String.fromCodePoint(Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10));
    }

    return entities[code.toLowerCase()] || entity;
  });
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
      .map(([, name, doubleQuoted, singleQuoted]) => [name.toLowerCase(), decodeHtml(doubleQuoted ?? singleQuoted)]),
  );
}

function exactlyOne(values, label, pageUrl) {
  assert.equal(values.length, 1, `Expected exactly one ${label}: ${pageUrl}`);
  assert.ok(values[0]?.trim(), `Empty ${label}: ${pageUrl}`);
  return values[0];
}

function verifyPageMetadata(html, canonicalUrl) {
  const heads = [...html.matchAll(/<head(?:\s[^>]*)?>([\s\S]*?)<\/head>/gi)];
  assert.equal(heads.length, 1, `Expected one HTML head: ${canonicalUrl}`);
  // Ignore script payloads, including serialized React metadata, when counting tags.
  const head = heads[0][1].replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const metaTags = [...head.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  const meta = (key) => exactlyOne(
    metaTags.filter((tag) => tag.name === key || tag.property === key).map((tag) => tag.content),
    key,
    canonicalUrl,
  );

  const title = exactlyOne(
    [...head.matchAll(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/gi)].map(([, text]) => decodeHtml(text)),
    "title",
    canonicalUrl,
  );
  const description = meta("description");
  const canonical = exactlyOne(
    links.filter((link) => link.rel?.split(/\s+/).includes("canonical")).map((link) => link.href),
    "canonical link",
    canonicalUrl,
  );
  assert.equal(canonical, canonicalUrl, `Wrong canonical: ${canonicalUrl}`);

  const openGraphUrl = meta("og:url");
  assert.equal(openGraphUrl, canonicalUrl, `Open Graph URL must match canonical: ${canonicalUrl}`);
  assert.equal(meta("og:title"), title, `Open Graph title must match title: ${canonicalUrl}`);
  assert.equal(meta("og:description"), description, `Open Graph description must match description: ${canonicalUrl}`);
  assert.equal(meta("twitter:title"), title, `Twitter title must match title: ${canonicalUrl}`);
  assert.equal(meta("twitter:description"), description, `Twitter description must match description: ${canonicalUrl}`);

  const directives = meta("robots").toLowerCase().split(/\s*,\s*/);
  assert.ok(directives.includes("index") && directives.includes("follow"), `Canonical page must allow indexing: ${canonicalUrl}`);
  assert.ok(!directives.includes("noindex") && !directives.includes("nofollow") && !directives.includes("none"), `Conflicting robots directives: ${canonicalUrl}`);

  for (const key of ["og:image", "twitter:image"]) {
    const image = meta(key);
    assert.match(image, /^https?:\/\//, `${key} must be absolute: ${canonicalUrl}`);
    assert.ok(new URL(image).hostname, `${key} must be a valid absolute URL: ${canonicalUrl}`);
  }
  assert.equal(meta("og:image:width"), "1200", `Unexpected Open Graph image width: ${canonicalUrl}`);
  assert.equal(meta("og:image:height"), "630", `Unexpected Open Graph image height: ${canonicalUrl}`);

  return { title, description, canonical, openGraphUrl };
}

function verifyStructuredData(html, canonicalUrl, isProtectionPage) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, tag]) => attributes(tag).type === "application/ld+json");
  assert.ok(scripts.length, `Structured data is missing: ${canonicalUrl}`);
  const nodes = [];

  function collectNodes(value) {
    if (Array.isArray(value)) {
      value.forEach(collectNodes);
    } else if (value && typeof value === "object") {
      nodes.push(value);
      if (value["@graph"]) collectNodes(value["@graph"]);
    }
  }

  for (const [, , content] of scripts) {
    let data;
    assert.doesNotThrow(() => { data = JSON.parse(content); }, `Invalid JSON-LD: ${canonicalUrl}`);
    collectNodes(data);
  }

  if (isProtectionPage) {
    const pages = nodes.filter((node) => [node["@type"]].flat().includes("WebPage"));
    assert.equal(pages.length, 1, `Expected one WebPage in JSON-LD: ${canonicalUrl}`);
    const page = pages[0];
    assert.equal(page["@id"], `${canonicalUrl}#webpage`, `Wrong WebPage ID: ${canonicalUrl}`);
    assert.equal(page.url, canonicalUrl, `Wrong WebPage URL: ${canonicalUrl}`);
    assert.equal(page.isPartOf?.["@id"], `${new URL(canonicalUrl).origin}/#website`, `WebPage must reference WebSite: ${canonicalUrl}`);
    assert.equal(page.mainEntity?.["@id"], `${canonicalUrl}#service`, `WebPage must reference Service: ${canonicalUrl}`);
    assert.ok(nodes.some((node) => node["@id"] === page.mainEntity["@id"] && [node["@type"]].flat().includes("Service")), `Referenced Service is missing: ${canonicalUrl}`);
  }
}

const sitemap = await exportedFile("sitemap.xml");
const robots = await exportedFile("robots.txt");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
const siteUrl = urls[0]?.origin;

assert.equal(siteUrl, SITE_URL, "Exported site address must match NEXT_PUBLIC_SITE_URL at build time");
assert.equal(urls.length, 10, "Sitemap must contain all ten canonical public pages");
assert.equal(new Set(urls.map((url) => url.href)).size, urls.length, "Sitemap URLs must be unique");
assert.equal(urls[0].pathname, "/", "The homepage must be the first sitemap URL");
assert.ok(!urls.some((url) => url.pathname === "/regions/yug-rossii/"), "The South alias must not appear in the sitemap");
assert.ok(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`));

const titles = new Set();
const descriptions = new Set();
let homeMetadata;

for (const url of urls) {
  assert.equal(url.origin, siteUrl, `Unexpected sitemap origin: ${url.href}`);
  assert.ok(url.pathname.endsWith("/"), `Expected a directory URL: ${url.href}`);

  const html = await exportedFile(join(url.pathname.slice(1), "index.html"));
  assert.match(html, /<html lang="ru"/);
  assert.match(html, /<main(?:\s|>)/);
  assert.match(html, /<h1(?:\s|>)/);
  assert.ok(!html.includes('hidden id="S:'), `Page content must be visible without JavaScript: ${url.href}`);
  const metadata = verifyPageMetadata(html, url.href);
  assert.ok(!titles.has(metadata.title), `Duplicate page title: ${url.href}`);
  assert.ok(!descriptions.has(metadata.description), `Duplicate page description: ${url.href}`);
  titles.add(metadata.title);
  descriptions.add(metadata.description);
  if (url.pathname === "/") homeMetadata = metadata;
  verifyStructuredData(html, url.href, url.pathname === "/" || url.pathname.startsWith("/regions/"));
  assert.ok(!html.includes("/_next/image?"), `Runtime image optimization found: ${url.href}`);
  assert.ok(!html.includes("/title.png") && !html.includes("/example.png"), `Unoptimized image found: ${url.href}`);
  assert.ok(html.includes("ОКНО ЩИТ"), `New brand is missing: ${url.href}`);
  assert.ok(!/Без Осколков|БЕЗ ОСКОЛКОВ|bezoskolkov\.ru/.test(html), `Old brand found: ${url.href}`);
  assert.ok(html.includes('href="/privacy/"') && html.includes('href="/personal-data-consent/"'), `Legal links missing: ${url.href}`);
  assert.ok(!/<(?:script|img)[^>]+src="https?:\/\/(?:mc|mc\.webvisor)\.yandex\./.test(html), `Unconditional analytics request found: ${url.href}`);
}

for (const path of ["privacy/", "personal-data-consent/"]) {
  const html = await exportedFile(`${path}index.html`);
  const siteLink = [...html.matchAll(/<a\b([^>]*)>([^<]*)<\/a>/gi)]
    .some(([, tag, label]) => attributes(tag).href === SITE_URL && decodeHtml(label) === SITE_DOMAIN);
  assert.ok(siteLink, `Configured site domain and link must be present in static HTML: ${path}`);
}

const home = await exportedFile("index.html");
assert.match(home, /<form[^>]*method="post"/, "Contact forms must never fall back to GET with personal data");
assert.match(home, /<fieldset[^>]*disabled=""/, "Contact fields must stay disabled until JavaScript can submit them safely");
for (const text of ["Один удар.", "Защитная плёнка", "Плёнку будет видно на окне?"]) {
  assert.ok(home.includes(text), `Main content is missing from static HTML: ${text}`);
}

const south = await exportedFile("regions/yug-rossii/index.html");
const southMetadata = verifyPageMetadata(south, `${siteUrl}/`);
assert.deepEqual(southMetadata, homeMetadata, "The South alias must share the homepage canonical and metadata");
verifyStructuredData(south, `${siteUrl}/`, true);

const notFound = await exportedFile("404.html");
assert.match(notFound, /<meta name="robots" content="noindex"/);

for (const asset of ["hero-768.webp", "hero-1280.webp", "hero-1536.webp", "comparison-768.webp", "comparison-1280.webp", "comparison-1536.webp", "og-image.png"]) {
  assert.ok((await stat(new URL(asset, output))).size > 0, `Missing image: ${asset}`);
}

console.log(`Verified ${urls.length} canonical pages, unique SEO metadata, linked JSON-LD, the South alias, sitemap, robots.txt, and static images.`);
