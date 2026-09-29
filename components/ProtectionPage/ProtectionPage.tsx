/* eslint-disable @next/next/no-img-element -- Responsive WebP files are generated ahead of the static export. */
import Link from "@/components/NavigationLink";
import type { Region } from "@/lib/regions";
import { localRegions, regionHref, regions } from "@/lib/regions";
import { DEFAULT_PHONE, SITE_NAME, SITE_URL, formatPhone, phoneHref } from "@/lib/site";
import { getCanonicalUrl, getPageTitle, getProtectionPageData } from "@/lib/seo";
import { ArrowIcon, CheckIcon, ClockIcon, FragmentsIcon, LayersIcon, PhoneIcon, ShieldIcon } from "@/components/icons";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import { ContactModalTrigger } from "@/components/ContactModal/ContactModalTrigger";
import { MobileCall } from "@/components/MobileCall/MobileCall";
import { ShockwaveFlow } from "@/components/ShockwaveFlow";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import styles from "./ProtectionPage.module.scss";

const benefits = [
  { icon: FragmentsIcon, number: "01", title: "Удерживает осколки", text: "После разрушения плёнка помогает сохранить фрагменты стекла связанными между собой." },
  { icon: ShieldIcon, number: "02", title: "Снижает риск травм", text: "Уменьшается опасность от свободно разлетающегося оконного стекла." },
  { icon: LayersIcon, number: "03", title: "Усиливает остекление", text: "Многослойный полиэстер и прочный клеевой слой распределяют воздействие." },
  { icon: ClockIcon, number: "04", title: "Работает 24 / 7", text: "После установки защита постоянно находится на стекле и не требует активации." },
];

const applications = [
  ["01", "Квартиры", "Комнаты, спальни, кухни, лоджии и балконы."],
  ["02", "Частные дома", "Панорамные окна, входные группы и двери со стеклом."],
  ["03", "Офисы", "Рабочие пространства с большим количеством остекления."],
  ["04", "Магазины", "Витрины и крупноформатные стеклянные конструкции."],
  ["05", "Общественные объекты", "Помещения с высокой проходимостью людей."],
];

const installSteps = [
  ["01", "Осматриваем", "Фиксируем размеры, тип стекла, состояние рамы и условия эксплуатации."],
  ["02", "Подбираем систему", "Определяем плёнку и необходимость периметрального крепления."],
  ["03", "Готовим стекло", "Тщательно очищаем поверхность перед монтажом."],
  ["04", "Наносим плёнку", "Раскраиваем материал и устанавливаем его на подготовленное стекло."],
  ["05", "Фиксируем", "Удаляем влагу и воздух, при необходимости выполняем крепление к раме."],
];

const faq = [
  ["Плёнка сделает окно небьющимся?", "Нет. При достаточно сильном воздействии стекло может разрушиться. Задача плёнки — удерживать фрагменты вместе и уменьшать их свободный разлёт."],
  ["Защищает ли плёнка от взрыва?", "Корректнее говорить о снижении последствий разрушения остекления. Плёнка не останавливает взрыв или ударную волну, но помогает уменьшить опасность вторичных осколков стекла."],
  ["Защитит ли она от осколков БПЛА или боеприпасов?", "Защитная оконная плёнка не является бронёй. Её основная функция в такой ситуации — уменьшение разлёта самого оконного стекла при разрушении."],
  ["Плёнку будет видно на окне?", "Качественная прозрачная защитная плёнка практически незаметна после правильной установки и сохраняет естественный свет."],
  ["Нужно менять стеклопакет?", "Во многих случаях нет: плёнка устанавливается на существующее подходящее остекление. Возможность монтажа определяем после оценки окна."],
  ["Сколько занимает установка?", "Срок зависит от количества, размеров и сложности окон. Предварительно оценим его по фотографиям и размерам."],
];

type ProtectionPageProps = { region?: Region };

export function ProtectionPage({ region }: ProtectionPageProps) {
  const phone = region?.phone || process.env.DEFAULT_PHONE || DEFAULT_PHONE;
  const regionName = region?.name || "Юг России";
  const location = region ? region.locative : "на Юге России";
  const pageData = getProtectionPageData(region);
  const canonicalUrl = getCanonicalUrl(pageData.path);
  const heroMeta = region?.serviceArea || ["Для квартир", "Домов", "Офисов", "Витрин"];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: getPageTitle(pageData.title),
        description: pageData.description,
        inLanguage: "ru-RU",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": `${canonicalUrl}#service` },
        hasPart: { "@id": `${canonicalUrl}#faq` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_URL}/hero-1536.webp`,
          width: 1536,
          height: 1024,
        },
      },
      {
        "@type": "Service",
        "@id": `${canonicalUrl}#service`,
        name: `Установка защитной противоосколочной плёнки на окна ${location}`,
        description: pageData.description,
        url: canonicalUrl,
        mainEntityOfPage: { "@id": `${canonicalUrl}#webpage` },
        serviceType: "Подбор и установка защитной противоосколочной плёнки на окна",
        areaServed: region?.serviceArea || regions.map((item) => item.name),
        provider: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          telephone: phone,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        url: `${canonicalUrl}#faq`,
        inLanguage: "ru-RU",
        isPartOf: { "@id": `${canonicalUrl}#webpage` },
        mainEntity: faq.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteHeader phone={phone} />
      <main className={region ? styles.root : `${styles.root} ${styles.animatedHome}`}>
        <section className="hero">
          <div className="hero-backdrop" aria-hidden="true" />
          {region && region.slug !== "yug-rossii" && (
            <div className="shell">
              <Breadcrumbs
                items={[
                  { label: "Главная", href: "/" },
                  { label: region.shortName, href: regionHref(region) },
                ]}
                variant="dark"
              />
            </div>
          )}
          <div className="shell hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span /> Защита остекления {location}</div>
              <h1>Защитная<br /><em>противоосколочная</em><br />плёнка для окон</h1>
              <p className="hero-lead">
                {region?.description || "Снижаем риск травмирования осколками стекла при взрывах, ударах и разрушении остекления."}
              </p>
              <div className="hero-actions">
                <ContactModalTrigger className="button button-primary" regionName={regionName} phone={phone} position="hero">Рассчитать стоимость <ArrowIcon /></ContactModalTrigger>
                <a className="phone-link" href={phoneHref(phone)} data-analytics-goal="phone_click" data-cta-position="hero"><PhoneIcon /><span><small>Консультация</small>{formatPhone(phone)}</span></a>
              </div>
              <div className="hero-meta">
                {heroMeta.map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>
            <div className="hero-visual">
              <img
                src="/hero-1536.webp"
                srcSet="/hero-768.webp 768w, /hero-1280.webp 1280w, /hero-1536.webp 1536w"
                alt="Профессиональная установка защитной плёнки и пример удержания разрушенного стекла"
                width={1536}
                height={1024}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                sizes="(max-width: 900px) calc(100vw - 30px), (max-width: 1304px) 52vw, 645px"
              />
            </div>
          </div>
          <a className="scroll-cue" href="#comparison"><span>↓</span> Узнать, как это работает</a>
        </section>

        <section className="comparison section" id="comparison">
          <div className="shell">
            <div className="section-heading split-heading">
              <div><span className="section-code">01 — КОНТРОЛЬ РАЗРУШЕНИЯ</span><h2>Один удар.<br /><em>Два сценария.</em></h2></div>
              <p>Обычное стекло может стать источником опасных осколков. Защитная плёнка не отменяет разрушение — она помогает изменить его характер.</p>
            </div>
            <figure className="comparison-figure">
              <div className="comparison-image">
                <img
                  src="/comparison-1536.webp"
                  srcSet="/comparison-768.webp 768w, /comparison-1280.webp 1280w, /comparison-1536.webp 1536w"
                  alt="Сравнение разрушения окна без защитной плёнки и с защитной плёнкой"
                  width={1536}
                  height={1024}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 900px) 100vw, 1180px"
                />
              </div>
              <figcaption>
                <span><b>Без плёнки</b> Свободный разлёт фрагментов</span>
                <span><b>С плёнкой</b> Стекло остаётся связанным</span>
              </figcaption>
            </figure>
            <div className="truth-line"><ShieldIcon /><strong>Важно:</strong> плёнка не делает стекло неразрушимым — она делает его разрушение более контролируемым.</div>
          </div>
        </section>

        <section className="benefits section">
          <div className="shell">
            <div className="section-heading centered-heading"><span className="section-code">02 — ЗАЧЕМ ЭТО НУЖНО</span><h2>Незаметна на стекле.<br /><em>Заметна в момент воздействия.</em></h2></div>
            <div className="benefit-grid">
              {benefits.map(({ icon: Icon, ...benefit }) => (
                <article className="benefit-card" key={benefit.number}>
                  <div className="benefit-top"><span>{benefit.number}</span><Icon /></div>
                  <h3>{benefit.title}</h3><p>{benefit.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="shock section" id="technology">
          <div className="shell">
            <div className="section-heading split-heading light-heading">
              <div><span className="section-code">03 — МЕХАНИКА ЗАЩИТЫ</span><h2>Что происходит<br /><em>при ударной волне?</em></h2></div>
              <p>Нагрузка проходит цепочку за доли секунды. Плёнка включается в работу пассивно — в момент разрушения стекла.</p>
            </div>
            <ShockwaveFlow />
            <blockquote>Главная задача защитной плёнки — не сделать стекло неразрушимым, а <mark>контролировать характер его разрушения</mark> и уменьшить опасность вторичных осколков.</blockquote>
          </div>
        </section>

        <section className="system section">
          <div className="shell system-grid">
            <div className="system-copy">
              <span className="section-code">04 — КОМПЛЕКСНЫЙ ПОДХОД</span>
              <h2>Плёнка + стекло<br /><em>+ оконная рама</em></h2>
              <p>Для повышенного уровня защиты важна не только толщина материала. После разрушения повреждённое полотно должно удерживаться относительно рамы.</p>
              <div className="system-note"><ShieldIcon /><span><strong>Максимальная эффективность</strong> достигается при защите всего оконного проёма как единой системы.</span></div>
            </div>
            <div className="layers-diagram" aria-label="Состав защитной системы">
              <div className="layer-card layer-1"><span>01</span><b>Стекло</b><small>Принимает воздействие</small></div>
              <div className="layer-card layer-2"><span>02</span><b>Защитная плёнка</b><small>Связывает фрагменты</small></div>
              <div className="layer-card layer-3"><span>03</span><b>Крепление</b><small>Удерживает относительно рамы</small></div>
              <div className="layer-card layer-4"><span>04</span><b>Оконная рама</b><small>Принимает нагрузку системы</small></div>
            </div>
          </div>
        </section>

        <section className="solutions section" id="films">
          <div className="shell">
            <div className="section-heading split-heading"><div><span className="section-code">05 — ПОДБОР РЕШЕНИЯ</span><h2>Не просто толще.<br /><em>Правильно для задачи.</em></h2></div><p>Учитываем стекло, размер проёма, назначение помещения, раму и требуемый уровень защиты.</p></div>
            <div className="solution-grid">
              <article><span>01 / БАЗОВАЯ</span><h3>Удержание осколков</h3><p>Прозрачная защитная плёнка для снижения свободного разлёта фрагментов.</p><ul><li><CheckIcon />Существующие окна</li><li><CheckIcon />Высокое светопропускание</li><li><CheckIcon />Профессиональный монтаж</li></ul></article>
              <article className="featured-solution"><span>02 / УСИЛЕННАЯ</span><h3>Плёнка + крепление</h3><p>Система с дополнительной фиксацией плёнки по периметру относительно оконной рамы.</p><ul><li><CheckIcon />Крупные проёмы</li><li><CheckIcon />Комплексная оценка</li><li><CheckIcon />Повышенный уровень защиты</li></ul><div>Рекомендуем после осмотра</div></article>
              <article><span>03 / СПЕЦИАЛЬНАЯ</span><h3>Под задачу объекта</h3><p>Индивидуальный подбор характеристик материала и способа монтажа.</p><ul><li><CheckIcon />Коммерческие объекты</li><li><CheckIcon />Витрины и фасады</li><li><CheckIcon />Подбор по документации</li></ul></article>
            </div>
            <p className="solution-disclaimer">Эффективность зависит от типа и состояния стекла, размера проёма, плёнки, рамы, способа монтажа и характера воздействия.</p>
          </div>
        </section>

        <section className="installation section" id="installation">
          <div className="shell">
            <div className="section-heading split-heading"><div><span className="section-code">06 — ТЕХНОЛОГИЯ МОНТАЖА</span><h2>От осмотра<br /><em>до готовой защиты.</em></h2></div><p>Качество защитной системы напрямую зависит от подготовки, монтажа и корректного крепления.</p></div>
            <div className="install-list">
              {installSteps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p><i aria-hidden="true">↘</i></article>)}
            </div>
          </div>
        </section>

        <section className="applications section" id="applications">
          <div className="shell applications-grid">
            <div className="application-intro"><span className="section-code">07 — ГДЕ ПРИМЕНЯЕТСЯ</span><h2>Для любого<br /><em>остекления.</em></h2><p>Во многих случаях безопасность можно повысить без полной замены окон на специализированные конструкции.</p><a className="text-link" href="#estimate">Обсудить свой объект <ArrowIcon /></a></div>
            <div className="application-list">
              {applications.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div><ArrowIcon /></article>)}
            </div>
          </div>
        </section>

        <section className="documents section" id="documents">
          <div className="shell documents-grid">
            <div><span className="section-code">08 — ДОКУМЕНТЫ И ИСПЫТАНИЯ</span><h2>Проверяем не обещания,<br /><em>а характеристики.</em></h2></div>
            <div className="document-card">
              <p>При подборе системы важно сверять документы именно на выбранный материал и схему монтажа.</p>
              <ul><li><span>01</span>Паспорт и происхождение плёнки</li><li><span>02</span>Заявленные характеристики материала</li><li><span>03</span>Протоколы профильных испытаний, если они есть</li><li><span>04</span>Совместимость с типом остекления</li></ul>
              <p className="document-note">Не подменяем реальные испытания общими сертификатами. Покажем доступные документы на конкретное решение до монтажа.</p>
            </div>
          </div>
        </section>

        <section className="regions-section section">
          <div className="shell">
            <div className="section-heading split-heading"><div><span className="section-code">09 — ГЕОГРАФИЯ</span><h2>Работаем<br /><em>по Югу России.</em></h2></div><p>{region?.description || "Выезжаем на жилые и коммерческие объекты. Для каждого региона действует отдельная консультация и номер связи."}</p></div>
            <div className="region-links">
              {localRegions.map((item) => <Link className={region?.slug === item.slug ? "active" : ""} href={regionHref(item)} prefetch={false} key={item.slug}><span>{item.shortName}</span><small>{item.serviceArea.slice(0, 3).join(" · ")}</small><ArrowIcon /></Link>)}
            </div>
          </div>
        </section>

        <section className="faq section" id="faq">
          <div className="shell faq-grid">
            <div><span className="section-code">10 — FAQ</span><h2>Отвечаем<br /><em>прямо.</em></h2><p>Без обещаний «неразрушимых окон» и универсального решения для любого воздействия.</p></div>
            <div className="faq-list">{faq.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>{String(index + 1).padStart(2, "0")}</span>{question}<i /></summary><p>{answer}</p></details>)}</div>
          </div>
        </section>

        <section className="estimate section" id="estimate">
          <div className="shell estimate-shell">
            <div className="estimate-copy"><span className="section-code">БЕСПЛАТНЫЙ ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ</span><h2>Сделайте остекление<br /><em>безопаснее.</em></h2><p>Оставьте заявку или позвоните. Фотографии и примерных размеров окон достаточно, чтобы начать подбор.</p><a href={phoneHref(phone)}><PhoneIcon /><span><small>Позвонить специалисту</small>{formatPhone(phone)}</span></a></div>
            <LeadForm regionName={regionName} phone={formatPhone(phone)} />
          </div>
        </section>
      </main>
      <MobileCall phone={phone} />
      <SiteFooter phone={phone} />
    </>
  );
}
