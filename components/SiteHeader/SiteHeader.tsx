import Link from "next/link";
import { formatPhone, phoneHref } from "@/lib/site";
import { Burger } from "@/components/Burger";
import { PhoneIcon, ShieldIcon } from "@/components/icons";
import styles from "./SiteHeader.module.scss";

export function SiteHeader({ phone }: { phone: string }) {
  return (
    <header className={`${styles.root} site-header`}>
      <div className="header-inner shell">
        <Link className="brand" href="/" aria-label="Контур Защиты — главная">
          <span className="brand-mark"><ShieldIcon /></span>
          <span className="brand-copy"><strong>КОНТУР</strong><small>защита остекления</small></span>
        </Link>

        <nav className="desktop-nav" aria-label="Основная навигация">
          <Link href="/#technology">Как работает</Link>
          <Link href="/#installation">Монтаж</Link>
          <Link href="/#applications">Объекты</Link>
          <Link href="/company">О компании</Link>
          <Link href="/contacts">Контакты</Link>
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
