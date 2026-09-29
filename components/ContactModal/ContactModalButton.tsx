"use client";

import dynamic from "next/dynamic";
import { useCallback, useState, type ReactNode } from "react";
import type { LeadFormClientProps } from "@/components/LeadForm/LeadFormClient";

const ContactModal = dynamic(() => import("./ContactModal").then((module) => module.ContactModal), {
  ssr: false,
  loading: () => <span role="status" className="visually-hidden">Открываем форму…</span>,
});

type ContactModalButtonProps = Omit<LeadFormClientProps, "variant"> & {
  children?: ReactNode;
  className?: string;
  position?: "header" | "hero" | "company" | "contacts" | "form" | "modal";
};

export function ContactModalButton({ children = "Заказать обратный звонок", className = "button button-primary", position = "form", ...formProps }: ContactModalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button type="button" className={className} aria-haspopup="dialog" aria-expanded={isOpen} onClick={() => setIsOpen(true)} data-analytics-goal="callback_open" data-cta-position={position}>{children}</button>
      {isOpen && <ContactModal {...formProps} onClose={close} />}
    </>
  );
}
