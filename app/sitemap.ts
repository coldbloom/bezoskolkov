import type { MetadataRoute } from "next";
import { regions } from "@/lib/regions";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/company", "/contacts"];

  return [
    ...staticRoutes.map((route, index) => ({
      url: `${SITE_URL}${route}`,
      changeFrequency: index === 0 ? "weekly" as const : "monthly" as const,
      priority: index === 0 ? 1 : 0.7,
    })),
    ...regions.map((region) => ({
      url: `${SITE_URL}/regions/${region.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
