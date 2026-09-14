'use client';

import { useState } from 'react';
import Link from 'next/link';
import s from './Menu.module.scss';

type WithOnCloseProps = {
  onCloseAction: () => void;
};

const pages = [
  { title: 'Главная', href: '/' },
  { title: 'О компании', href: '/company/' },
  { title: 'Контакты', href: '/contacts/' },
  { title: 'Рассчитать стоимость', href: '/#estimate' },
];

const protectionPages = [
  {
    title: 'Как работает защитная плёнка',
    href: '/#technology',
  },
  {
    title: 'Плёнки и решения',
    href: '/#films',
  },
  { title: 'Профессиональный монтаж', href: '/#installation' },
  { title: 'Объекты применения', href: '/#applications' },
  { title: 'Документы и испытания', href: '/#documents' },
  { title: 'Вопросы и ответы', href: '/#faq' },
];

export const Menu = ({ onCloseAction }: WithOnCloseProps) => {
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  return (
    <nav id="site-mobile-menu" className={s.modalWrapper} aria-label="Мобильная навигация">
      <div className={s.tabsWrapper}>
        <div className={s.menuHeader}>
          <p className={s.menuEyebrow}>Без Осколков</p>
          <h3 className={s.menuTitle} id="mobile-menu-title">Защитная плёнка для окон</h3>
          <button className={s.closeButton} type="button" onClick={onCloseAction} aria-label="Закрыть меню">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {pages.slice(0, 3).map((page) => (
          <Link key={page.href} href={page.href} prefetch={false} className={s.tabLink} onClick={onCloseAction}>
            {page.title}
          </Link>
        ))}

        <button
          type="button"
          className={s.servicesButton}
          onClick={() => setIsServicesOpen((prev) => !prev)}
          aria-expanded={isServicesOpen}
          aria-controls="protection-menu"
        >
          <span>Защитная плёнка</span>
          <span className={isServicesOpen ? s.chevronOpen : s.chevron} aria-hidden="true">
            <svg className={s.chevronIcon} viewBox="0 0 20 20" fill="none">
              <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        {isServicesOpen && (
          <div id="protection-menu" className={s.servicesList}>
            {protectionPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                prefetch={false}
                className={s.subTabLink}
                onClick={onCloseAction}
              >
                {page.title}
              </Link>
            ))}
          </div>
        )}

        {pages.slice(3).map((page) => (
          <Link key={page.href} href={page.href} prefetch={false} className={`${s.tabLink} ${s.ctaLink}`} onClick={onCloseAction}>
            {page.title}
          </Link>
        ))}
      </div>
    </nav>
  );
};
