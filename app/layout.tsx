import type { Metadata, Viewport } from "next";
import { DEFAULT_PHONE, SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — защитная плёнка для окон`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Защита остекления противоосколочной плёнкой для квартир, домов, офисов и коммерческих объектов на Юге России.",
  keywords: ["защитная плёнка для окон", "противоосколочная плёнка", "защита остекления", "антивандальная плёнка", "плёнка от осколков"],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
};

const globalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.ico`,
      telephone: DEFAULT_PHONE,
      areaServed: "Юг России",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
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
      </body>
    </html>
  );
}
