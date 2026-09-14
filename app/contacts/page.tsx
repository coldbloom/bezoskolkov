import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentPage } from "@/components/ContentPage";
import { ArrowIcon, PhoneIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { localRegions, regionHref } from "@/lib/regions";
import { createPageMetadata } from "@/lib/seo";
import { DEFAULT_PHONE, SITE_NAME, SITE_URL, formatPhone, phoneHref } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Контакты",
  description: "Контакты компании Без Осколков. Консультация и расчёт защитной противоосколочной плёнки для окон на Юге России.",
  path: "/contacts/",
});

export default function ContactsPage() {
  const phone = process.env.DEFAULT_PHONE || DEFAULT_PHONE;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${SITE_URL}/contacts/#webpage`,
    url: `${SITE_URL}/contacts/`,
    name: `Контакты | ${SITE_NAME}`,
    inLanguage: "ru-RU",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <ContentPage>
      <JsonLd data={jsonLd} />
      <section className="contact-page">
        <div className="shell">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Контакты", href: "/contacts/" }]} />
          <span className="section-code">КОНТАКТЫ</span>
          <h1>Давайте обсудим<br /><em>ваше остекление.</em></h1>
          <div className="contact-grid">
            <div className="contact-primary"><p>Пришлите фотографии, примерные размеры окон и расскажите об объекте. Этого достаточно, чтобы начать подбор решения.</p><a href={phoneHref(phone)}><PhoneIcon /><span><small>Ежедневно, 08:00–20:00</small>{formatPhone(phone)}</span></a><Link className="button button-primary" href="/#estimate" prefetch={false}>Получить расчёт <ArrowIcon /></Link></div>
            <div className="contact-regions"><h2>Выберите свой регион</h2>{localRegions.map((region) => <Link href={regionHref(region)} prefetch={false} key={region.slug}><span><b>{region.shortName}</b><small>{formatPhone(region.phone)}</small></span><ArrowIcon /></Link>)}</div>
          </div>
        </div>
      </section>
    </ContentPage>
  );
}
