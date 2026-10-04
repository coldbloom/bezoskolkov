import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentPage } from "@/components/ContentPage";
import { LEGAL_REVISION_LABEL, isLegalConfigured, legalOperator } from "@/lib/legal";
import { DEFAULT_PHONE, formatPhone, phoneHref } from "@/lib/site";
import styles from "./LegalDocument.module.scss";

export function LegalContact() {
  const phone = process.env.DEFAULT_PHONE || DEFAULT_PHONE;

  return (
    <>
      <a href={phoneHref(phone)} data-call-tracking-id="legal_contact">{formatPhone(phone)}</a>
      {legalOperator.email && <> или <a href={`mailto:${legalOperator.email}`}>{legalOperator.email}</a></>}
    </>
  );
}

export function LegalOperatorDetails() {
  return (
    <>
      {legalOperator.name && <p><strong>Оператор:</strong> {legalOperator.name}.</p>}
      {legalOperator.address && <p><strong>Адрес для обращений:</strong> {legalOperator.address}.</p>}
      {legalOperator.inn && <p><strong>ИНН:</strong> {legalOperator.inn}.</p>}
      <p><strong>По вопросам персональных данных:</strong> <LegalContact />.</p>
    </>
  );
}

export function LegalDocument({ title, path, children }: { title: string; path: string; children: ReactNode }) {
  return (
    <ContentPage>
      <div className={`${styles.root} shell`}>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: title, href: path }]} />
        <article className={styles.document}>
          <header className={styles.header}>
            <span className="section-code">Документы</span>
            <h1>{title}</h1>
            <p className={styles.revision}>Редакция от {LEGAL_REVISION_LABEL}</p>
          </header>
          {!isLegalConfigured && (
            <p className={styles.notice}>
              Сведения об операторе уточняются.
              Для связи используйте телефон <LegalContact />.
            </p>
          )}
          {children}
        </article>
      </div>
    </ContentPage>
  );
}
