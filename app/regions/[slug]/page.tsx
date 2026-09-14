import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProtectionPage } from "@/components/ProtectionPage";
import { getRegion, regionHref, regions } from "@/lib/regions";
import { createPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return regions.map(({ slug }) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/regions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const region = getRegion(slug);
  if (!region) return {};

  const title = `Защитная плёнка для окон ${region.locative}`;
  const description = `Установка защитной противоосколочной плёнки ${region.locative}. Снижаем разлёт осколков при разрушении стекла. Квартиры, дома, офисы, витрины.`;

  return createPageMetadata({
    title,
    description,
    path: regionHref(region),
  });
}

export default async function RegionPage({ params }: PageProps<"/regions/[slug]">) {
  const { slug } = await params;
  const region = getRegion(slug);
  if (!region) notFound();

  return <ProtectionPage region={region} />;
}
