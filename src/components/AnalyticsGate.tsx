"use client";

import { Analytics } from "@vercel/analytics/next";
import { consentStore } from "@/lib/consent";
import { useStore } from "@/lib/store";

/** Analytika se vůbec nenačte, dokud návštěvník neudělí souhlas. */
export function AnalyticsGate() {
  const consent = useStore(consentStore);
  return consent === "all" ? <Analytics /> : null;
}
