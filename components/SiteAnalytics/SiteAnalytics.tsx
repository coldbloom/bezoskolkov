"use client";

import Link from "@/components/NavigationLink";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  COOKIE_SETTINGS_EVENT,
  getConsentSnapshot,
  getServerConsentSnapshot,
  setAnalyticsConsent,
  subscribeToAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics-consent";
import { startAnalytics, stopAnalytics, trackPageView, trackSiteGoal } from "@/lib/analytics";
import styles from "./SiteAnalytics.module.scss";

export function SiteAnalytics() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(
    subscribeToAnalyticsConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const bannerRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const openSettings = () => {
      returnFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement : null;
      setSettingsOpen(true);
      window.requestAnimationFrame(() => bannerRef.current?.focus());
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  useEffect(() => {
    if (consent === "pending") return;
    if (consent !== "accepted") {
      stopAnalytics();
      return;
    }
    return startAnalytics();
  }, [consent]);

  useEffect(() => {
    if (consent === "accepted") trackPageView(pathname);
  }, [consent, pathname]);

  useEffect(() => {
    const handleContactClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLElement>("[data-analytics-goal]");
      const goal = link?.dataset.analyticsGoal;
      if (!goal || !/^[a-z0-9_]{1,64}$/.test(goal)) return;
      trackSiteGoal(goal, {
        position: link?.dataset.ctaPosition ?? "content",
        network: link?.dataset.network ?? "phone",
      });
    };
    document.addEventListener("click", handleContactClick);
    return () => document.removeEventListener("click", handleContactClick);
  }, []);

  const choose = (choice: AnalyticsConsent) => {
    setAnalyticsConsent(choice);
    if (choice === "declined") stopAnalytics();
    setSettingsOpen(false);
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
  };

  if (consent === "pending" || (consent !== null && !settingsOpen)) return null;

  return (
    <section
      ref={bannerRef}
      className={styles.banner}
      aria-label="Настройки cookie и статистики"
      aria-describedby="analytics-consent-description"
      tabIndex={-1}
    >
      <p id="analytics-consent-description" className={styles.text}>
        Мы используем необязательные cookie и Яндекс Метрику для статистики посещений.
        Они включатся только с вашего согласия. Подробнее в{" "}
        <Link href="/privacy/" prefetch={false} aria-label="Политика обработки персональных данных">политике</Link>.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.decline} onClick={() => choose("declined")}>
          Отклонить
        </button>
        <button type="button" className={styles.accept} onClick={() => choose("accepted")}>
          Принять
        </button>
      </div>
    </section>
  );
}
