/* eslint-disable @next/next/no-img-element -- Local messenger SVGs are shared with the header. */
import Link from "@/components/NavigationLink";
import { localRegions, regionHref } from "@/lib/regions";
import { formatPhone, phoneHref, SITE_NAME, TELEGRAM_URL, MAX_URL } from "@/lib/site";
import { CookieSettingsButton } from "@/components/SiteAnalytics";
import { CodeCake } from "@/components/CodeCake";
import { BrandMark } from "@/components/BrandMark";
import styles from "./SiteFooter.module.scss";

export function SiteFooter({ phone }: { phone: string }) {
  return (
    <footer className={`${styles.root} site-footer`}>
      <div className="shell footer-grid">
        <div className="footer-brand">
          <BrandMark className="brand-mark" />
          <div><strong>{SITE_NAME}</strong><p>Профессиональная защита остекления на Юге России.</p></div>
        </div>
        <div>
          <p className="footer-title">Навигация</p>
          <Link href="/" prefetch={false}>Главная</Link>
          <Link href="/company/" prefetch={false}>О компании</Link>
          <Link href="/contacts/" prefetch={false}>Контакты</Link>
        </div>
        <div>
          <p className="footer-title">Регионы</p>
          {localRegions.map((region) => <Link href={regionHref(region)} prefetch={false} key={region.slug}>{region.shortName}</Link>)}
        </div>
        <div className="footer-contact">
          <p className="footer-title">Консультация</p>
          <a className="footer-phone" href={phoneHref(phone)} data-analytics-goal="phone_click" data-cta-position="footer">{formatPhone(phone)}</a>
          <div className="footer-messengers">
            <a className="footer-messenger" href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram" data-analytics-goal="social_click" data-network="telegram" data-cta-position="footer">
              <span className="messenger-icon messenger-icon-telegram" aria-hidden="true"><img src="/tg-icon.svg" alt="" width={22} height={19} /></span>
              <span>Telegram</span>
            </a>
            <a className="footer-messenger" href={MAX_URL} target="_blank" rel="noopener noreferrer" aria-label="Написать в Max" data-analytics-goal="social_click" data-network="max" data-cta-position="footer">
              <span className="messenger-icon messenger-icon-max" aria-hidden="true"><img src="/max-icon.svg" alt="" width={25} height={25} /></span>
              <span>Max</span>
            </a>
          </div>
          <p>Пришлите размеры и фото окон — подготовим предварительный расчёт.</p>
          <Link className="text-link" href="/#estimate" prefetch={false}>Получить расчёт →</Link>
        </div>
      </div>
      <nav className="shell footer-legal" aria-label="Правовая информация">
        <Link href="/privacy/" prefetch={false}>Политика обработки персональных данных</Link>
        <Link href="/personal-data-consent/" prefetch={false}>Согласие на обработку данных</Link>
        <CookieSettingsButton />
      </nav>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} {SITE_NAME}</span>
        <span>Информация на сайте не является публичной офертой</span>
      </div>
      <div className="codecake-wrapper">
        <CodeCake />
      </div>
    </footer>
  );
}
