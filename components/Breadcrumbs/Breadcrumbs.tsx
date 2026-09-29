import Link from "@/components/NavigationLink";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import styles from "./Breadcrumbs.module.scss";

export type BreadcrumbItem = {
  label: string;
  href: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  variant?: "light" | "dark";
};

export function Breadcrumbs({ items, variant = "light" }: BreadcrumbsProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav
        className={`${styles.root} ${variant === "dark" ? styles.dark : ""}`}
        aria-label="Хлебные крошки"
      >
        <ol>
          {items.map((item, index) => (
            <li key={item.href}>
              {index < items.length - 1
                ? <Link href={item.href} prefetch={false}>{item.label}</Link>
                : <span aria-current="page">{item.label}</span>}
              {index < items.length - 1 && <span aria-hidden="true">/</span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
