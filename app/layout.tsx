import type { Metadata, Viewport } from "next";
import { DEFAULT_PHONE, SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { getPageTitle, homePageData } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: getPageTitle(homePageData.title),
    template: `%s | ${SITE_NAME}`,
  },
  description: homePageData.description,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined,
    yandex: process.env.YANDEX_SITE_VERIFICATION?.trim() || undefined,
  },
  formatDetection: { email: false, address: false, telephone: false },
};

const globalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: homePageData.description,
      logo: `${SITE_URL}/icon.svg`,
      telephone: process.env.DEFAULT_PHONE || DEFAULT_PHONE,
      areaServed: "Юг России",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description: homePageData.description,
      inLanguage: "ru-RU",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111310",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru">
      <body>
        <JsonLd data={globalJsonLd} />
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
