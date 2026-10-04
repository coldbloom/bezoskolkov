const counterId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID?.trim() ?? "";
export const YANDEX_METRIKA_ID = /^\d+$/.test(counterId) ? Number(counterId) : 0;

type GoalParams = Record<string, string | number | boolean>;
type MetrikaArguments = [number, "init" | "hit" | "reachGoal", ...unknown[]];
type MetrikaFunction = ((...args: MetrikaArguments) => void) & {
  a?: MetrikaArguments[];
  l?: number;
};
type MetrikaState = {
  counterId: number;
  lastTrackedPath: string;
  lastTrackedUrl: string;
};

declare global {
  interface Window {
    ym?: MetrikaFunction;
    __oknoshieldMetrika?: MetrikaState;
  }
}

export function isAnalyticsConfigured() {
  return Number.isSafeInteger(YANDEX_METRIKA_ID) && YANDEX_METRIKA_ID > 0;
}

function getCounterState() {
  if (typeof window === "undefined" || !isAnalyticsConfigured() || typeof window.ym !== "function") return null;
  const state = window.__oknoshieldMetrika;
  return state?.counterId === YANDEX_METRIKA_ID ? state : null;
}

export function trackSiteGoal(goal: string, params: GoalParams = {}) {
  if (!getCounterState() || !/^[a-z0-9_]{1,64}$/.test(goal)) return;
  // Custom goals contain only event labels, never names, phones or form values.
  window.ym?.(YANDEX_METRIKA_ID, "reachGoal", goal, {
    ...params,
    page: window.location.pathname,
  });
}

export function trackPageView(pathname: string) {
  const state = getCounterState();
  const path = pathname.replace(/\/+$/, "") || "/";
  if (!state || state.lastTrackedPath === path) return;

  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const url = currentPath === path ? window.location.href : new URL(pathname, window.location.origin).href;
  const referer = state.lastTrackedUrl;
  state.lastTrackedPath = path;
  state.lastTrackedUrl = url;
  window.ym?.(YANDEX_METRIKA_ID, "hit", url, { title: document.title, referer });
}
