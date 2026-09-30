import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import sharp from "sharp";

nextEnv.loadEnvConfig(fileURLToPath(new URL("../", import.meta.url)), process.argv.includes("--development"));
// Import after loading .env* so the image and Next.js use the same site address.
const { SITE_DOMAIN } = await import("../lib/site-url.mjs");
const domainText = SITE_DOMAIN.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

// app/icon.svg is the single logo source for the UI, favicon and social preview.
const icon = await readFile(new URL("../app/icon.svg", import.meta.url));
const socialTemplate = await readFile(new URL("../assets/og-image.svg", import.meta.url), "utf8");
const socialSvg = socialTemplate.replace(
  'href="../app/icon.svg"',
  `href="data:image/svg+xml;base64,${icon.toString("base64")}"`,
).replaceAll("{{SITE_DOMAIN}}", domainText);
await sharp(Buffer.from(socialSvg))
  .png({ palette: true })
  .toFile(new URL("../public/og-image.png", import.meta.url).pathname);

const png = await sharp(icon).resize(64, 64).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = 64;
header[7] = 64;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(new URL("../app/favicon.ico", import.meta.url), Buffer.concat([header, png]));
console.log("Generated ОКНО ЩИТ social image and favicon from SVG sources.");
