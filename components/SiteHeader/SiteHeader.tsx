import Link from "next/link";
import { formatPhone, phoneHref } from "@/lib/site";
import { Burger } from "@/components/Burger";
import { PhoneIcon, ShieldIcon } from "@/components/icons";
import styles from "./SiteHeader.module.scss";

export function SiteHeader({ phone }: { phone: string }) {
  return (
    <header className={`${styles.root} site-header`}>
      <div className="header-inner shell">
        <Link className="brand" href="/" prefetch={false} aria-label="Без Осколков — главная">
          <span className="brand-mark"><ShieldIcon /></span>
          <span className="brand-copy"><strong>БЕЗ ОСКОЛКОВ</strong><small>защита остекления</small></span>
        </Link>

        <nav className="desktop-nav" aria-label="Основная навигация">
          <Link href="/#technology" prefetch={false}>Как работает</Link>
          <Link href="/#installation" prefetch={false}>Монтаж</Link>
          <Link href="/#applications" prefetch={false}>Объекты</Link>
          <Link href="/company/" prefetch={false}>О компании</Link>
          <Link href="/contacts/" prefetch={false}>Контакты</Link>
        </nav>

        <a className="header-phone" href={phoneHref(phone)}>
          <PhoneIcon />
          <span><small>Ежедневно, 08:00–20:00</small>{formatPhone(phone)}</span>
        </a>

        <Burger />
      </div>
    </header>
  );
}
