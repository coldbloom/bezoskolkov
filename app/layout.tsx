import type { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Контур Защиты — защитная плёнка для окон",
    template: "%s | Контур Защиты",
  },
  description: "Защита остекления противоосколочной плёнкой для квартир, домов, офисов и коммерческих объектов на Юге России.",
  keywords: ["защитная плёнка для окон", "противоосколочная плёнка", "защита остекления", "антивандальная плёнка", "плёнка от осколков"],
  authors: [{ name: "Контур Защиты" }],
  creator: "Контур Защиты",
  publisher: "Контур Защиты",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Контур Защиты",
    title: "Защитная противоосколочная плёнка для окон",
    description: "Снижаем риск травмирования осколками стекла при ударах, взрывах и разрушении остекления.",
    images: [{ url: "/title.png", width: 1536, height: 1024, alt: "Защита окон противоосколочной плёнкой" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Защитная противоосколочная плёнка для окон",
    description: "Профессиональная защита остекления на Юге России.",
    images: ["/title.png"],
  },
  robots: { index: true, follow: true },
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
      <body>{children}</body>
    </html>
  );
}
