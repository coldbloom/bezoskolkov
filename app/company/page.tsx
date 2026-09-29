/* eslint-disable @next/next/no-img-element -- Responsive WebP files are generated ahead of the static export. */
import { ContactModalTrigger } from "@/components/ContactModal/ContactModalTrigger";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentPage } from "@/components/ContentPage";
import { CheckIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { createPageMetadata } from "@/lib/seo";
import { DEFAULT_PHONE, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "О компании",
  description: "ОКНО ЩИТ — профессиональный подбор и монтаж защитных плёнок для окон на Юге России. Честно оцениваем задачу и не обещаем невозможного.",
  path: "/company/",
});

export default function CompanyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_URL}/company/#webpage`,
    url: `${SITE_URL}/company/`,
    name: `О компании | ${SITE_NAME}`,
    inLanguage: "ru-RU",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <ContentPage>
      <JsonLd data={jsonLd} />
      <section className="inner-hero">
        <div className="shell">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "О компании", href: "/company/" }]} variant="dark" />
        </div>
        <div className="shell inner-hero-grid">
          <div><span className="section-code">О КОМПАНИИ</span><h1>Инженерный подход<br /><em>к безопасности окон.</em></h1><p>Подбираем и устанавливаем защитные плёнки для существующего остекления. Смотрим на систему целиком: стекло, материал, крепление и раму.</p></div>
          <div className="inner-hero-image">
            <img
              src="/hero-1536.webp"
              srcSet="/hero-768.webp 768w, /hero-1280.webp 1280w, /hero-1536.webp 1536w"
              alt="Специалист устанавливает защитную плёнку на окно"
              width={1536}
              height={1024}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              sizes="(max-width: 900px) calc(100vw - 30px), (max-width: 1304px) 48vw, 595px"
            />
          </div>
        </div>
      </section>
      <section className="company-values section">
        <div className="shell">
          <div className="section-heading split-heading"><div><span className="section-code">НАШ ПРИНЦИП</span><h2>Без магии.<br /><em>Без лишних обещаний.</em></h2></div><p>Защитная плёнка — эффективный элемент системы безопасности, когда она правильно подобрана и установлена.</p></div>
          <div className="value-grid">
            <article><span>01</span><h3>Говорим честно</h3><p>Не называем плёнку бронёй и не обещаем неразрушимое стекло.</p></article>
            <article><span>02</span><h3>Сначала оцениваем</h3><p>Учитываем стекло, площадь, раму, назначение объекта и характер рисков.</p></article>
            <article><span>03</span><h3>Соблюдаем технологию</h3><p>Подготовка поверхности и качество монтажа критичны для работы системы.</p></article>
          </div>
        </div>
      </section>
      <section className="company-system section">
        <div className="shell company-system-grid">
          <div>
            <span className="section-code">ЧТО ВЫ ПОЛУЧАЕТЕ</span>
            <h2>Понятное решение<br /><em>под ваш объект.</em></h2>
          </div>
          <div>
            <ul>
              <li><CheckIcon />Предварительную оценку по фото и размерам</li>
              <li><CheckIcon />Осмотр остекления и оконных рам</li>
              <li><CheckIcon />Подбор материала и способа крепления</li>
              <li><CheckIcon />Профессиональный монтаж</li>
              <li><CheckIcon />Рекомендации по эксплуатации после установки</li>
            </ul>
            <ContactModalTrigger className="button button-primary" regionName="Юг России" phone={process.env.DEFAULT_PHONE || DEFAULT_PHONE} position="company">Обсудить задачу</ContactModalTrigger>
          </div>
        </div>
      </section>
    </ContentPage>
  );
}
