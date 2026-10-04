import { chmod, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Generate directly from the originals, never from an already compressed variant.
const images = [
  { name: "hero", source: "title.png" },
  { name: "comparison", source: "example.png" },
];
const widths = [480, 768, 1024, 1280, 1536];
const formats = [
  { extension: "avif", encode: (image) => image.avif({ quality: 55, effort: 6 }) },
  // These settings reproduce the existing 768/1280/1536 WebP files byte for byte.
  { extension: "webp", encode: (image) => image.webp({ quality: 76, effort: 6 }) },
];

for (const { name, source } of images) {
  const original = fileURLToPath(new URL(`../assets/originals/${source}`, import.meta.url));
  const metadata = await sharp(original).metadata();
  if (!metadata.width || !metadata.height || metadata.width < widths.at(-1)
    || metadata.width * 2 !== metadata.height * 3) {
    throw new Error(`${source} must have a 3:2 aspect ratio and be at least 1536 px wide.`);
  }

  for (const width of widths) {
    for (const { extension, encode } of formats) {
      const filename = `${name}-${width}.${extension}`;
      const target = new URL(`../public/${filename}`, import.meta.url);
      const image = sharp(original).resize({ width, withoutEnlargement: true });
      const output = await encode(image).toBuffer();
      const previous = await readFile(target).catch((error) => {
        if (error.code !== "ENOENT") throw error;
        return undefined;
      });
      if (!previous?.equals(output)) {
        await writeFile(target, output);
      }
      // rsync -a preserves permissions; nginx must be able to read public assets.
      await chmod(target, 0o644);
      console.log(`${filename}: ${output.length} bytes`);
    }
  }
}
