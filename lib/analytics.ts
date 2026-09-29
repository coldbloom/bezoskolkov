import { hasAnalyticsConsent } from "@/lib/analytics-consent";

// Replace only this value with your counter ID. 000111222 is a disabled placeholder.
export const YANDEX_METRIKA_ID = Number("000111222");
const PLACEHOLDER_COUNTER_ID = 111222;
const SCRIPT_ID = "oknoshchit-yandex-metrika";
type GoalParams = Record<string, string | number | boolean>;
type MetrikaCommand = "init" | "hit" | "reachGoal" | "destruct";
type MetrikaArguments = [number, MetrikaCommand, ...unknown[]];
type MetrikaFunction = ((...args: MetrikaArguments) => void) & {
  a?: MetrikaArguments[];
  l?: number;
};

declare global {
  interface Window {
    ym?: MetrikaFunction;
  }
}

let initialized = false;
let lastTrackedPath: string | null = null;

export function isAnalyticsConfigured() {
  return Number.isSafeInteger(YANDEX_METRIKA_ID) &&
    YANDEX_METRIKA_ID > 0 && YANDEX_METRIKA_ID !== PLACEHOLDER_COUNTER_ID;
}

function canTrack() {
  return typeof window !== "undefined" && isAnalyticsConfigured() &&
    hasAnalyticsConsent() && initialized && typeof window.ym === "function";
}

export function trackSiteGoal(goal: string, params: GoalParams = {}) {
  if (!canTrack()) return;
  // Do not pass names, phone numbers, message contents or other form values here.
  window.ym?.(YANDEX_METRIKA_ID, "reachGoal", goal, {
    ...params,
    page: window.location.pathname,
  });
}

export function trackPageView(pathname: string) {
  if (!canTrack() || lastTrackedPath === pathname) return;
  lastTrackedPath = pathname;
  // Queries and fragments can contain personal information; omit both.
  window.ym?.(YANDEX_METRIKA_ID, "hit", `${window.location.origin}${pathname}`, {
    title: document.title,
    referer: "",
  });
}

function clearAnalyticsStorage() {
  const keys = document.cookie.split(";").map((cookie) => cookie.split("=")[0].trim());
  const hostname = window.location.hostname;
  const domains = ["", hostname, `.${hostname}`];
  const labels = hostname.split(".");
  for (let i = 1; i < labels.length - 1; i++) {
    domains.push(`.${labels.slice(i).join(".")}`);
  }

  const paths = new Set(["/", window.location.pathname]);
  const segments = window.location.pathname.split("/").filter(Boolean);
  for (let i = 1; i <= segments.length; i++) {
    paths.add(`/${segments.slice(0, i).join("/")}`);
    paths.add(`/${segments.slice(0, i).join("/")}/`);
  }

  for (const key of keys.filter((name) => /^_?ym(?:_|\d)/.test(name))) {
    for (const domain of domains) {
      for (const path of paths) {
        document.cookie = `${key}=; Max-Age=0; Path=${path}; SameSite=Lax${domain ? `; Domain=${domain}` : ""}`;
      }
    }
  }

  for (const storageName of ["localStorage", "sessionStorage"] as const) {
    try {
      const storage = window[storageName];
      for (let i = storage.length - 1; i >= 0; i--) {
        const key = storage.key(i);
        if (key && /^_?ym(?:_|\d)/.test(key)) storage.removeItem(key);
      }
    } catch {
      // Browser policy may make storage inaccessible.
    }
  }
}

export function stopAnalytics() {
  if (typeof window === "undefined") return;
  if (initialized) window.ym?.(YANDEX_METRIKA_ID, "destruct");
  initialized = false;
  lastTrackedPath = null;
  if (window.ym?.a) window.ym.a = [];
  document.getElementById(SCRIPT_ID)?.remove();
  clearAnalyticsStorage();
}

export function startAnalytics() {
  if (!isAnalyticsConfigured() || !hasAnalyticsConsent()) return () => {};

  let cancelled = false;
  let idleHandle: number | undefined;
  let timerHandle: number | undefined;
  let script: HTMLScriptElement | undefined;

  const initialize = () => {
    if (cancelled || !hasAnalyticsConsent() || initialized) return;
    window.ym?.(YANDEX_METRIKA_ID, "init", {
      ssr: true,
      defer: true,
      webvisor: false,
      clickmap: false,
      trackLinks: false,
      trackHash: false,
      ecommerce: false,
      disableYtm: true,
      accurateTrackBounce: false,
      url: `${window.location.origin}${window.location.pathname}`,
      referrer: "",
    });
    initialized = true;
    trackPageView(window.location.pathname);
  };

  const load = () => {
    if (cancelled || !hasAnalyticsConsent()) return;

    if (!window.ym) {
      const queue: MetrikaFunction = (...args) => {
        (queue.a ??= []).push(args);
      };
      queue.l = Date.now();
      window.ym = queue;
    }

    script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}`;
    script.async = true;
    script.onload = initialize;
    document.head.appendChild(script);
  };

  const schedule = () => {
    if (cancelled) return;
    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(load, { timeout: 2000 });
    } else {
      timerHandle = window.setTimeout(load, 0);
    }
  };

  // Native insertion lets us cancel pending work on consent withdrawal. Unlike
  // next/script lazyOnload, an unmounted component cannot leave a queued load.
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });

  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
    if (timerHandle !== undefined) window.clearTimeout(timerHandle);
    if (script) script.onload = null;
    stopAnalytics();
  };
}
