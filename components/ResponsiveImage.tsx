const widths = [480, 768, 1024, 1280, 1536];

type ResponsiveImageProps = {
  name: "hero" | "comparison";
  alt: string;
  sizes: string;
  priority?: boolean;
};

/** Both formats are generated locally; the exported site needs no image server. */
export function ResponsiveImage({ name, alt, sizes, priority = false }: ResponsiveImageProps) {
  const srcSet = (format: "avif" | "webp") => widths.map((width) => `/${name}-${width}.${format} ${width}w`).join(", ");
  const avifSrcSet = srcSet("avif");

  return (
    <>
      {priority && (
        <link
          rel="preload"
          as="image"
          type="image/avif"
          imageSrcSet={avifSrcSet}
          imageSizes={sizes}
          fetchPriority="high"
        />
      )}
      <picture>
        <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
        <img
          src={`/${name}-1536.webp`}
          srcSet={srcSet("webp")}
          sizes={sizes}
          alt={alt}
          width={1536}
          height={1024}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
        />
      </picture>
    </>
  );
}
