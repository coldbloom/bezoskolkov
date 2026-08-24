import type { ReactNode } from "react";
import { DEFAULT_PHONE } from "@/lib/site";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import styles from "./ContentPage.module.scss";

export function ContentPage({ children }: { children: ReactNode }) {
  const phone = process.env.DEFAULT_PHONE || DEFAULT_PHONE;

  return (
    <>
      <SiteHeader phone={phone} />
      <main className={`${styles.root} content-main`}>{children}</main>
      <SiteFooter phone={phone} />
    </>
  );
}
