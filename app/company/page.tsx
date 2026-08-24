import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { CheckIcon, ShieldIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "О компании",
  description: "Контур Защиты — профессиональный подбор и монтаж защитных плёнок для окон на Юге России. Честно оцениваем задачу и не обещаем невозможного.",
  alternates: { canonical: "/company" },
};

export default function CompanyPage() {
  return (
    <ContentPage>
      <section className="inner-hero">
        <div className="shell inner-hero-grid">
          <div><span className="section-code">О КОМПАНИИ</span><h1>Инженерный подход<br /><em>к безопасности окон.</em></h1><p>Подбираем и устанавливаем защитные плёнки для существующего остекления. Смотрим на систему целиком: стекло, материал, крепление и раму.</p></div>
          <div className="inner-hero-image"><Image src="/title.png" alt="Специалист устанавливает защитную плёнку на окно" fill priority sizes="(max-width: 900px) 100vw, 48vw" /></div>
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
          <div className="company-shield"><ShieldIcon /><span>КЗ</span></div>
          <div><span className="section-code">ЧТО ВЫ ПОЛУЧАЕТЕ</span><h2>Понятное решение<br /><em>под ваш объект.</em></h2><ul><li><CheckIcon />Предварительную оценку по фото и размерам</li><li><CheckIcon />Осмотр остекления и оконных рам</li><li><CheckIcon />Подбор материала и способа крепления</li><li><CheckIcon />Профессиональный монтаж</li><li><CheckIcon />Рекомендации по эксплуатации после установки</li></ul><Link className="button button-primary" href="/#estimate">Обсудить задачу</Link></div>
        </div>
      </section>
    </ContentPage>
  );
}
