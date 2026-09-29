import type { MetadataRoute } from "next";
import { localRegions } from "@/lib/regions";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/company/", "/contacts/", "/privacy/", "/personal-data-consent/"];

  return [
    ...staticRoutes.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...localRegions.map((region) => ({
      url: `${SITE_URL}/regions/${region.slug}/`,
    })),
  ];
}
