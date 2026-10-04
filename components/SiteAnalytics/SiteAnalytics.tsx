import Script from "next/script";
import { isAnalyticsConfigured, YANDEX_METRIKA_ID } from "@/lib/analytics";
import { getYandexMetrikaScript } from "@/lib/yandex-metrika";
import { AnalyticsEvents } from "./AnalyticsEvents";

export function SiteAnalytics() {
  if (!isAnalyticsConfigured()) {
    throw new Error("Укажите положительный целый NEXT_PUBLIC_YANDEX_METRIKA_ID в .env перед сборкой сайта.");
  }

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {getYandexMetrikaScript(YANDEX_METRIKA_ID)}
      </Script>
      <AnalyticsEvents />
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- Metrika's fallback pixel works without JavaScript. */}
          <img
            src={`https://mc.yandex.ru/watch/${YANDEX_METRIKA_ID}`}
            width={1}
            height={1}
            style={{ position: "absolute", left: -9999 }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
