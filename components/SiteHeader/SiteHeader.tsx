import Link from "@/components/NavigationLink";
import { SITE_NAME } from "@/lib/site";
import { QuickContact } from "@/components/QuickContact";
import { Burger } from "@/components/Burger";
import { BrandMark } from "@/components/BrandMark";
import styles from "./SiteHeader.module.scss";

export function SiteHeader({ phone }: { phone: string }) {
  return (
    <header className={`${styles.root} site-header`}>
      <div className="header-inner shell">
        <Link className="brand" href="/" prefetch={false} aria-label={`${SITE_NAME} — главная`}>
          <BrandMark className="brand-mark" />
          <span className="brand-copy"><strong>{SITE_NAME}</strong><small>защита остекления</small></span>
        </Link>

        <nav className="desktop-nav" aria-label="Основная навигация">
          <Link href="/#technology" prefetch={false}>Как работает</Link>
          <Link href="/#installation" prefetch={false}>Монтаж</Link>
          <Link href="/#applications" prefetch={false}>Объекты</Link>
          <Link href="/company/" prefetch={false}>О компании</Link>
          <Link href="/contacts/" prefetch={false}>Контакты</Link>
        </nav>

        <QuickContact phone={phone} />

        <Burger />
      </div>
    </header>
  );
}
