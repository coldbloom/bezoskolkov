import type { Metadata } from "next";
import { ProtectionPage } from "@/components/ProtectionPage";

export const metadata: Metadata = {
  title: "Защитная противоосколочная плёнка для окон",
  description: "Профессиональная установка защитной противоосколочной плёнки для окон. Снижаем риск травм от разлёта стекла при ударах, взрывах и разрушении остекления.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <ProtectionPage />;
}
