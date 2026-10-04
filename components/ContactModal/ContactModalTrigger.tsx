import type { ReactNode } from "react";
import { LEGAL_VERSION } from "@/lib/legal";
import { formatPhone } from "@/lib/site";
import { ContactModalButton } from "./ContactModalButton";

type ContactModalTriggerProps = {
  regionName: string;
  phone: string;
  className?: string;
  children?: ReactNode;
  position?: "header" | "hero" | "company" | "contacts" | "form" | "modal";
};

export function ContactModalTrigger(props: ContactModalTriggerProps) {
  return <ContactModalButton {...props} phone={formatPhone(props.phone)} consentVersion={LEGAL_VERSION} />;
}
