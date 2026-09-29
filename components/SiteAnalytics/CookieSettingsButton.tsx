"use client";

import { COOKIE_SETTINGS_EVENT } from "@/lib/analytics-consent";
import styles from "./SiteAnalytics.module.scss";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      className={styles.settings}
      onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
    >
      Настройки cookie
    </button>
  );
}
