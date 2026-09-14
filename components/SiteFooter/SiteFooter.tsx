import Link from "next/link";
import { localRegions, regionHref } from "@/lib/regions";
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
          <div><strong>БЕЗ ОСКОЛКОВ</strong><p>Профессиональная защита остекления на Юге России.</p></div>
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
          <a className="footer-phone" href={phoneHref(phone)}>{formatPhone(phone)}</a>
          <p>Пришлите размеры и фото окон — подготовим предварительный расчёт.</p>
          <Link className="text-link" href="/#estimate" prefetch={false}>Получить расчёт →</Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Без Осколков</span>
        <span>Информация на сайте не является публичной офертой</span>
      </div>
      <div className="codecake-wrapper">
        <CodeCake />
      </div>
    </footer>
  );
}
