"use client";

import { useEffect } from "react";
import { initializeCallTracking, trackPhoneClick } from "@/lib/callTracking";

/** Capture also covers phone links added later in contact dialogs. */
export function PhoneClickTracking() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href^="tel:"]');
      const phone = link?.getAttribute("href")?.slice(4);
      if (!link || !phone) return;

      // Never cancel the native phone action or wait for the tracking request.
      trackPhoneClick(link.dataset.callTrackingId || "unlabelled", phone);
    };

    initializeCallTracking();
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
