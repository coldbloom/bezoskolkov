export const SITE_NAME = "Без Осколков";
export const DEFAULT_PHONE = "+79895052785";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://bezoskolkov.ru";

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
