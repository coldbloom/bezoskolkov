import { isLegalConfigured, LEGAL_VERSION } from "@/lib/legal";
import { LeadFormClient } from "./LeadFormClient";

export function LeadForm({ regionName, phone }: { regionName: string; phone: string }) {
  return <LeadFormClient regionName={regionName} phone={phone} legalConfigured={isLegalConfigured} consentVersion={LEGAL_VERSION} />;
}
