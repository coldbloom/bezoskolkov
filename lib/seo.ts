import type { Metadata } from "next";
import { SITE_NAME } from "./site";

export type PageData = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

const socialImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Защитная противоосколочная плёнка для окон",
  type: "image/png",
};

const defaultKeywords = [
  "защитная плёнка для окон",
  "противоосколочная плёнка",
  "защита остекления",
  "антивандальная плёнка",
  "плёнка от осколков",
];

export function createPageMetadata(pageData: PageData): Metadata {
  const fullTitle = `${pageData.title} | ${SITE_NAME}`;

  return {
    title: { absolute: fullTitle },
    description: pageData.description,
    keywords: pageData.keywords || defaultKeywords,
    alternates: { canonical: pageData.path },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: SITE_NAME,
      title: fullTitle,
      description: pageData.description,
      url: pageData.path,
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
