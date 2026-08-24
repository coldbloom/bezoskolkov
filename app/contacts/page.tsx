import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { ArrowIcon, PhoneIcon } from "@/components/icons";
import { regions } from "@/lib/regions";
import { DEFAULT_PHONE, formatPhone, phoneHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Контакты компании Контур Защиты. Консультация и расчёт защитной противоосколочной плёнки для окон на Юге России.",
  alternates: { canonical: "/contacts" },
};

export default function ContactsPage() {
  const phone = process.env.DEFAULT_PHONE || DEFAULT_PHONE;

  return (
    <ContentPage>
      <section className="contact-page">
        <div className="shell">
          <span className="section-code">КОНТАКТЫ</span>
          <h1>Давайте обсудим<br /><em>ваше остекление.</em></h1>
          <div className="contact-grid">
            <div className="contact-primary"><p>Пришлите фотографии, примерные размеры окон и расскажите об объекте. Этого достаточно, чтобы начать подбор решения.</p><a href={phoneHref(phone)}><PhoneIcon /><span><small>Ежедневно, 08:00–20:00</small>{formatPhone(phone)}</span></a><Link className="button button-primary" href="/#estimate">Получить расчёт <ArrowIcon /></Link></div>
            <div className="contact-regions"><h2>Выберите свой регион</h2>{regions.map((region) => <Link href={`/regions/${region.slug}`} key={region.slug}><span><b>{region.shortName}</b><small>{formatPhone(region.phone)}</small></span><ArrowIcon /></Link>)}</div>
          </div>
        </div>
      </section>
    </ContentPage>
  );
}
