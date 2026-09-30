// Shared by Next.js and the asset generator; NEXT_PUBLIC_* is inlined at build time.
export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://oknoshield.site").replace(/\/+$/, "");
export const SITE_DOMAIN = new URL(SITE_URL).host;
