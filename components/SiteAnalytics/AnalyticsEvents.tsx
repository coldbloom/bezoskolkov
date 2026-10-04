"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackPageView, trackSiteGoal } from "@/lib/analytics";

export function AnalyticsEvents() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    const handleContactClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLElement>("[data-analytics-goal]");
      const goal = link?.dataset.analyticsGoal;
      if (!goal) return;
      trackSiteGoal(goal, {
        position: link?.dataset.ctaPosition ?? "content",
        network: link?.dataset.network ?? "phone",
      });
    };

    document.addEventListener("click", handleContactClick);
    return () => document.removeEventListener("click", handleContactClick);
  }, []);

  return null;
}
