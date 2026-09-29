import type { Metadata } from "next";
import { regionHref, type Region } from "./regions";
import { SITE_NAME, SITE_URL } from "./site";

export type PageData = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

const socialImage = {
  url: `${SITE_URL}/og-image.png`,
  width: 1200,
  height: 630,
  alt: "Защитная противоосколочная плёнка для окон",
  type: "image/png",
};

export const homePageData: PageData = {
  title: "Противоосколочная плёнка на окна — установка на Юге России",
  description: "Установка защитной противоосколочной плёнки на окна квартир, домов, офисов и витрин на Юге России. Подбор под остекление, расчёт стоимости по фото и размерам.",
  path: "/",
  keywords: ["противоосколочная плёнка на окна", "установка защитной плёнки на окна", "защита окон от осколков", "защитная плёнка Юг России"],
};

export function getProtectionPageData(region?: Region): PageData {
  // The South route is an alias of the homepage, including its search/social metadata.
  if (!region || region.slug === "yug-rossii") return homePageData;

  return {
    title: `Защитная плёнка на окна ${region.locative} — установка`,
    description: region.seoDescription,
    path: regionHref(region),
    keywords: [`защитная плёнка на окна ${region.locative}`, `противоосколочная плёнка ${region.locative}`, `установка плёнки на окна ${region.locative}`],
  };
}

export function getCanonicalUrl(path: string) {
  return new URL(path, `${SITE_URL}/`).href;
}

export function getPageTitle(title: string) {
  return `${title} | ${SITE_NAME}`;
}

export function createPageMetadata(pageData: PageData): Metadata {
  const fullTitle = getPageTitle(pageData.title);
  const canonical = getCanonicalUrl(pageData.path);

  return {
    title: { absolute: fullTitle },
    description: pageData.description,
    keywords: pageData.keywords,
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: SITE_NAME,
      title: fullTitle,
      description: pageData.description,
      url: canonical,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: pageData.description,
      images: [socialImage],
    },
  };
}
