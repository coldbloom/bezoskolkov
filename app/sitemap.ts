import type { MetadataRoute } from "next";
import { regions } from "@/lib/regions";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "", changeFrequency: "weekly" as const, priority: 1, lastModified: "2026-08-24" },
    { path: "/company", changeFrequency: "monthly" as const, priority: 0.7, lastModified: "2026-08-24" },
    { path: "/contacts", changeFrequency: "monthly" as const, priority: 0.7, lastModified: "2026-08-24" },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: new Date(route.lastModified),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...regions.map((region) => ({
      url: `${SITE_URL}/regions/${region.slug}`,
      lastModified: new Date(region.lastModified),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
