import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `Страница не найдена | ${SITE_NAME}` },
};

export default function NotFound() {
  return (
    <main className="not-found"><span>404</span><h1>Такой страницы нет</h1><p>Вернитесь на главную — там всё о защите остекления.</p><Link className="button button-primary" href="/">На главную</Link></main>
  );
}
