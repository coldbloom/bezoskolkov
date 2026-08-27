import { ProtectionPage } from "@/components/ProtectionPage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Защитная противоосколочная плёнка для окон",
  description: "Профессиональная установка защитной противоосколочной плёнки для окон. Снижаем риск травм от разлёта стекла при ударах, взрывах и разрушении остекления.",
  path: "/",
});

export default function Home() {
  return <ProtectionPage />;
}
