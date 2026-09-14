import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const output = new URL("../out/", import.meta.url);

async function exportedFile(path) {
  return readFile(new URL(path, output), "utf8");
}

const sitemap = await exportedFile("sitemap.xml");
const robots = await exportedFile("robots.txt");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
const siteUrl = urls[0]?.origin;

assert.equal(urls.length, 8, "Sitemap must contain all eight canonical public pages");
assert.equal(urls[0].pathname, "/", "The homepage must be the first sitemap URL");
assert.ok(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`));

for (const url of urls) {
  assert.equal(url.origin, siteUrl, `Unexpected sitemap origin: ${url.href}`);
  assert.ok(url.pathname.endsWith("/"), `Expected a directory URL: ${url.href}`);

  const html = await exportedFile(join(url.pathname.slice(1), "index.html"));
  assert.match(html, /<html lang="ru"/);
  assert.match(html, /<main(?:\s|>)/);
  assert.match(html, /<h1(?:\s|>)/);
  assert.match(html, /<meta name="description" content="[^"]+"/);
  assert.ok(html.includes(`<link rel="canonical" href="${url.href}"/>`), `Wrong canonical: ${url.href}`);
  assert.ok(!html.includes("/_next/image?"), `Runtime image optimization found: ${url.href}`);
  assert.ok(!html.includes("/title.png") && !html.includes("/example.png"), `Unoptimized image found: ${url.href}`);
}

const home = await exportedFile("index.html");
for (const text of ["Один удар.", "Защитная плёнка", "Плёнку будет видно на окне?"]) {
  assert.ok(home.includes(text), `Main content is missing from static HTML: ${text}`);
}

const south = await exportedFile("regions/yug-rossii/index.html");
assert.ok(south.includes(`<link rel="canonical" href="${siteUrl}/"/>`), "The near-duplicate South page must canonicalize to the homepage");

const notFound = await exportedFile("404.html");
assert.match(notFound, /<meta name="robots" content="noindex"/);

for (const asset of ["hero-768.webp", "hero-1280.webp", "hero-1536.webp", "comparison-768.webp", "comparison-1280.webp", "comparison-1536.webp", "og-image.png"]) {
  assert.ok((await stat(new URL(asset, output))).size > 0, `Missing image: ${asset}`);
}

console.log(`Verified ${urls.length} canonical pages, the South alias, sitemap, robots.txt, and static images.`);
