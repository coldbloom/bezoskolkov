export const OBJECT_TYPES = ["Квартира", "Частный дом", "Офис", "Коммерческое помещение", "Другой объект"] as const;

export type LeadValues = {
  name: string;
  phone: string;
  object: string;
  consent: boolean;
};

export type LeadErrors = Partial<Record<keyof LeadValues, string>>;

export function formatLeadPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("7") || digits.startsWith("8")) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (!digits) return value ? "+7 " : "";

  let phone = `+7 (${digits.slice(0, 3)}`;
  if (digits.length >= 4) phone += `) ${digits.slice(3, 6)}`;
  if (digits.length >= 7) phone += `-${digits.slice(6, 8)}`;
  if (digits.length >= 9) phone += `-${digits.slice(8, 10)}`;
  return phone;
}

export function validateLead(values: LeadValues): LeadErrors {
  const errors: LeadErrors = {};
  if (values.name.trim().length > 80) errors.name = "Имя должно быть не длиннее 80 символов";
  if (!/^7\d{10}$/.test(values.phone.replace(/\D/g, ""))) {
    errors.phone = "Введите номер телефона полностью: +7 и 10 цифр";
  }
  if (values.object && !OBJECT_TYPES.includes(values.object as typeof OBJECT_TYPES[number])) {
    errors.object = "Выберите объект из списка";
  }
  if (!values.consent) errors.consent = "Для отправки заявки нужно ваше согласие на обработку данных";
  return errors;
}

/** Require an explicit API base so a static hosting fallback cannot accept a lead. */
export function getFeedbackEndpoint(apiBase: string | undefined) {
  const base = apiBase?.trim().replace(/\/+$/, "");
  if (!base) return null;
  if (base.startsWith("/") && !base.startsWith("//") && !/[?#\\]/.test(base)) return `${base}/feedback`;
  try {
    const url = new URL(base);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash) return null;
    if (url.protocol !== "https:" && !(local && url.protocol === "http:")) return null;
    return `${base}/feedback`;
  } catch {
    return null;
  }
}

export type LeadContext = { page: string; formPosition: "inline" | "modal" };

export function createLeadPayload(values: LeadValues, regionName: string, consentVersion: string, context: LeadContext) {
  if (Object.keys(validateLead(values)).length) throw new Error("Invalid lead");
  // Только путь: query/hash могут содержать лишние данные и не нужны для заявки.
  const page = context.page.split(/[?#]/, 1)[0];
  if (!page.startsWith("/") || page.startsWith("//") || /[\\\s]/.test(page) || page.length > 1024) {
    throw new Error("Invalid page");
  }
  return {
    name: values.name.trim(),
    phone: `+${values.phone.replace(/\D/g, "")}`,
    message: ["Заявка ОКНО ЩИТ", `Регион: ${regionName}`, values.object && `Объект: ${values.object}`].filter(Boolean).join(". "),
    personalDataConsent: true,
    consentVersion,
    consentedAt: new Date().toISOString(),
    page,
    formPosition: context.formPosition,
  };
}
