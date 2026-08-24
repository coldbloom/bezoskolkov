import Link from "next/link";
import { regions } from "@/lib/regions";
import { formatPhone, phoneHref } from "@/lib/site";
import { CodeCake } from "@/components/CodeCake";
import { ShieldIcon } from "@/components/icons";
import styles from "./SiteFooter.module.scss";

export function SiteFooter({ phone }: { phone: string }) {
  return (
    <footer className={`${styles.root} site-footer`}>
      <div className="shell footer-grid">
        <div className="footer-brand">
          <span className="brand-mark"><ShieldIcon /></span>
          <div><strong>КОНТУР</strong><p>Профессиональная защита остекления на Юге России.</p></div>
        </div>
        <div>
          <p className="footer-title">Навигация</p>
          <Link href="/">Главная</Link>
          <Link href="/company">О компании</Link>
          <Link href="/contacts">Контакты</Link>
        </div>
        <div>
          <p className="footer-title">Регионы</p>
          {regions.map((region) => <Link href={`/regions/${region.slug}`} key={region.slug}>{region.shortName}</Link>)}
        </div>
        <div className="footer-contact">
          <p className="footer-title">Консультация</p>
          <a className="footer-phone" href={phoneHref(phone)}>{formatPhone(phone)}</a>
          <p>Пришлите размеры и фото окон — подготовим предварительный расчёт.</p>
          <Link className="text-link" href="/#estimate">Получить расчёт →</Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Контур Защиты</span>
        <span>Информация на сайте не является публичной офертой</span>
      </div>
      <div className="codecake-wrapper">
        <CodeCake />
      </div>
    </footer>
  );
}
