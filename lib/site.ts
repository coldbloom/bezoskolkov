export { SITE_URL, SITE_DOMAIN } from "./site-url.mjs";

export const SITE_NAME = "ОКНО ЩИТ";
export const DEFAULT_PHONE = "+79895052785";
export const TELEGRAM_URL = "https://t.me/konstankk";
export const MAX_URL = "https://max.ru/u/f9LHodD0cOI7hGFwnp4y8CBCeTVIs3kkyT-JqLq2wJc3ES2VjFOgy02xevs";

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("7")) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }

  return phone;
}

export function phoneHref(phone: string) {
  return `tel:+${phone.replace(/\D/g, "")}`;
}
