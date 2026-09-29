export const ANALYTICS_CONSENT_KEY = "oknoshchit:analytics-consent";
export const ANALYTICS_CONSENT_VERSION = 1;
export const ANALYTICS_CONSENT_MAX_AGE = 180 * 24 * 60 * 60 * 1000;
export const COOKIE_SETTINGS_EVENT = "oknoshchit:cookie-settings";
const CONSENT_CHANGE_EVENT = "oknoshchit:analytics-consent-change";

export type AnalyticsConsent = "accepted" | "declined";
export type ConsentSnapshot = AnalyticsConsent | "pending" | null;

type ConsentRecord = {
  version: number;
  choice: AnalyticsConsent;
  updatedAt: number;
  expiresAt: number;
};

// If browser storage is unavailable, the choice lasts for this page only.
let memoryConsent: string | null = null;
let memoryOnly = false;

export function parseAnalyticsConsent(raw: string | null, now = Date.now()): ConsentRecord | null {
  if (!raw) return null;

  try {
    const record: unknown = JSON.parse(raw);
    if (!record || typeof record !== "object") return null;
    const candidate = record as Partial<ConsentRecord>;

    if (
      candidate.version !== ANALYTICS_CONSENT_VERSION ||
      (candidate.choice !== "accepted" && candidate.choice !== "declined") ||
      typeof candidate.updatedAt !== "number" ||
      typeof candidate.expiresAt !== "number" ||
      !Number.isFinite(candidate.updatedAt) ||
      !Number.isFinite(candidate.expiresAt) ||
      candidate.updatedAt > now ||
      candidate.expiresAt <= now ||
      candidate.expiresAt <= candidate.updatedAt ||
      candidate.expiresAt - candidate.updatedAt > ANALYTICS_CONSENT_MAX_AGE
    ) return null;

    return candidate as ConsentRecord;
  } catch {
    return null;
  }
}

function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  if (memoryOnly) return parseAnalyticsConsent(memoryConsent);

  try {
    return parseAnalyticsConsent(window.localStorage.getItem(ANALYTICS_CONSENT_KEY));
  } catch {
    return parseAnalyticsConsent(memoryConsent);
  }
}

export function getConsentSnapshot(): ConsentSnapshot {
  return readConsent()?.choice ?? null;
}

export function getServerConsentSnapshot(): ConsentSnapshot {
  return "pending";
}

export function hasAnalyticsConsent() {
  return getConsentSnapshot() === "accepted";
}

export function setAnalyticsConsent(choice: AnalyticsConsent) {
  const now = Date.now();
  const record: ConsentRecord = {
    version: ANALYTICS_CONSENT_VERSION,
    choice,
    updatedAt: now,
    expiresAt: now + ANALYTICS_CONSENT_MAX_AGE,
  };
  memoryConsent = JSON.stringify(record);

  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, memoryConsent);
    memoryOnly = false;
  } catch {
    // The choice still applies when private mode or storage policy blocks writes.
    memoryOnly = true;
  }

  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

export function subscribeToAnalyticsConsent(onChange: () => void) {
  let expiryTimer: number | undefined;

  const scheduleExpiry = () => {
    window.clearTimeout(expiryTimer);
    const record = readConsent();
    if (!record) return;

    expiryTimer = window.setTimeout(
      refresh,
      Math.min(Math.max(record.expiresAt - Date.now(), 1), 2_147_483_647),
    );
  };

  function refresh() {
    onChange();
    scheduleExpiry();
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ANALYTICS_CONSENT_KEY || event.key === null) {
      memoryOnly = false;
      refresh();
    }
  };

  window.addEventListener(CONSENT_CHANGE_EVENT, refresh);
  window.addEventListener("storage", handleStorage);
  window.addEventListener("focus", refresh);
  window.addEventListener("pageshow", refresh);
  document.addEventListener("visibilitychange", refresh);
  scheduleExpiry();

  return () => {
    window.clearTimeout(expiryTimer);
    window.removeEventListener(CONSENT_CHANGE_EVENT, refresh);
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("focus", refresh);
    window.removeEventListener("pageshow", refresh);
    document.removeEventListener("visibilitychange", refresh);
  };
}
