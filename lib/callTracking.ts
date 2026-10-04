/** Метки первого посещения вкладки: источник, канал, кампания, объявление, запрос. */
export type CallClickUtm = Partial<Record<"source" | "medium" | "campaign" | "content" | "term", string>>;

/** Анонимная сессия вкладки и её первоначальный источник трафика. */
type CallSession = {
  /** UUID, общий для кликов во время этой сессии, без fingerprinting. */
  sessionId: string;
  /** Адрес перехода на сайт. Браузер может передать только origin или пустую строку. */
  referrer?: string;
  /** UTM первого входа: не заменяются при переходах между страницами. */
  utm?: CallClickUtm;
  /** Идентификатор рекламного перехода Яндекса. */
  yclid?: string;
};

/** Данные одного нажатия. Факт состоявшегося звонка этот payload не подтверждает. */
export type CallClickPayload = CallSession & {
  /** Новый UUID для каждого отдельного клика. */
  eventId: string;
  /** Семантическое имя ссылки, например hero или footer. */
  trackingId: string;
  /** Номер из href без префикса tel:. */
  phone: string;
  /** Страница, на которой нажали ссылку; без query и hash. */
  page: string;
  /** Время браузера в UTC. Сервер отдельно добавляет время получения. */
  clientTimestamp: string;
};

const SESSION_KEY = "plenki_call_session_v1";
const UTM_FIELDS = ["source", "medium", "campaign", "content", "term"] as const;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isDevelopment = process.env.NODE_ENV !== "production";

// Кэш переживает повторный effect в Strict Mode. Storage переживает reload страницы.
let session: CallSession | undefined;

/** UUID через Web Crypto; fallback для браузеров без randomUUID. */
function createId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
}

/** Отбрасываем управляющие символы и ограничиваем длину до отправки в API. */
function text(value: unknown, limit = 255): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.replace(/\p{Cc}/gu, "").slice(0, limit) || undefined;
}

/** Читаем только известные поля: JSON в sessionStorage тоже может быть изменён. */
function attribution(value: { utm?: CallClickUtm; referrer?: string; yclid?: string }) {
  const utm: CallClickUtm = {};
  for (const field of UTM_FIELDS) {
    const label = text(value.utm?.[field]);
    if (label) utm[field] = label;
  }

  const referrer = text(value.referrer, 2048);
  const yclid = text(value.yclid);
  return {
    utm,
    referrer: referrer && /^https?:\/\//i.test(referrer) ? referrer : undefined,
    yclid: yclid && /^[a-zA-Z0-9._-]+$/.test(yclid) ? yclid : undefined,
  };
}

/** Один session ID и initial attribution на сессию вкладки, включая прямой вход без UTM. */
function getSession(): CallSession {
  if (session) return session;

  try {
    const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    if (stored && typeof stored.sessionId === "string" && UUID_PATTERN.test(stored.sessionId)) {
      session = { sessionId: stored.sessionId, ...attribution(stored) };
      return session;
    }
  } catch {
    // При запрете storage или повреждённом JSON остаётся кэш в памяти страницы.
  }

  const params = new URLSearchParams(window.location.search);
  const utm: CallClickUtm = {};
  for (const field of UTM_FIELDS) utm[field] = params.get(`utm_${field}`) || undefined;
  session = {
    sessionId: createId(),
    ...attribution({ utm, referrer: document.referrer, yclid: params.get("yclid") || undefined }),
  };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Без storage данные сохранятся до reload, но сам клик всё равно отправится.
  }
  return session;
}

/** Вызываем при загрузке любой страницы, чтобы сохранить UTM ещё до первого клика. */
export function initializeCallTracking(): void {
  try {
    getSession();
  } catch (error) {
    if (isDevelopment) console.warn("[call-click] Не удалось создать сессию", error);
  }
}

/**
 * Отправляем один запрос и сразу возвращаем управление обычной tel:-ссылке.
 * keepalive позволяет браузеру продолжить отправку после ухода со страницы.
 * Доставка без интернета не гарантируется; повторных отправок в этом MVP нет.
 * @param trackingId Постоянное имя кнопки, одинаковое между релизами.
 * @param phone Номер из телефонной ссылки без префикса tel:.
 */
export function trackPhoneClick(trackingId: string, phone: string): void {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
    if (!apiUrl) {
      if (isDevelopment) console.warn("[call-click] Не задан NEXT_PUBLIC_API_URL");
      return;
    }

    const url = `${apiUrl}/call-clicks`;
    const payload: CallClickPayload = {
      ...getSession(),
      eventId: createId(),
      trackingId,
      phone,
      page: window.location.pathname,
      clientTimestamp: new Date().toISOString(),
    };
    if (isDevelopment) console.info("[call-click] POST", url, payload);

    // JSON внутри text/plain: браузеру не нужен дополнительный CORS preflight.
    // fetch виден в Network → Fetch/XHR; ответ нужен только для отладки.
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: "omit",
    }).then((response) => {
      if (isDevelopment) console.info("[call-click] HTTP", response.status);
    }).catch((error: unknown) => {
      if (isDevelopment) console.warn("[call-click] Запрос не доставлен", error);
    });
  } catch (error) {
    // Ни ошибка аналитики, ни отсутствие Web Crypto не должны мешать звонку.
    if (isDevelopment) console.warn("[call-click] Ошибка подготовки запроса", error);
  }
}
