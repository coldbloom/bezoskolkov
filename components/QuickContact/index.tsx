/* eslint-disable @next/next/no-img-element -- Small local SVGs need no image optimizer or client runtime. */
import { formatPhone, MAX_URL, phoneHref, TELEGRAM_URL } from "@/lib/site";
import styles from "./QuickContact.module.scss";

export function QuickContact({ phone }: { phone: string }) {
  return (
    <nav className={styles.root} aria-label="Быстрая связь">
      <a href={TELEGRAM_URL} className={`${styles.link} ${styles.telegram}`} target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram" title="Написать в Telegram" data-analytics-goal="social_click" data-network="telegram" data-cta-position="header">
        <img src="/tg-icon.svg" alt="" width={21} height={18} loading="eager" aria-hidden="true" />
      </a>
      <a href={MAX_URL} className={`${styles.link} ${styles.max}`} target="_blank" rel="noopener noreferrer" aria-label="Написать в Max" title="Написать в Max" data-analytics-goal="social_click" data-network="max" data-cta-position="header">
        <img src="/max-icon.svg" alt="" width={24} height={24} loading="eager" aria-hidden="true" />
      </a>
      <a href={phoneHref(phone)} className={`${styles.link} ${styles.phone}`} aria-label={`Позвонить ${formatPhone(phone)}`} title={`Позвонить ${formatPhone(phone)}`} data-call-tracking-id="header" data-analytics-goal="phone_click" data-cta-position="header">
        <img src="/phone-icon.svg" alt="" width={18} height={18} loading="eager" aria-hidden="true" />
        <span>{formatPhone(phone)}</span>
      </a>
    </nav>
  );
}
