"use client";

import { useEffect, useId, useRef } from "react";
import { LeadFormClient, type LeadFormClientProps } from "@/components/LeadForm/LeadFormClient";
import styles from "./ContactModal.module.scss";

type ContactModalProps = Omit<LeadFormClientProps, "variant"> & { onClose: () => void };

export function ContactModal({ onClose, ...formProps }: ContactModalProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const { scrollX, scrollY } = window;
    const { style } = document.body;
    const previous = { overflow: style.overflow, position: style.position, top: style.top, left: style.left, width: style.width };

    // Native modal dialogs make the background inert and keep keyboard focus inside.
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    Object.assign(style, { overflow: "hidden", position: "fixed", top: `-${scrollY}px`, left: `-${scrollX}px`, width: "100%" });

    const viewport = window.visualViewport;
    const updateViewport = () => {
      if (viewport) dialog.style.setProperty("--dialog-height", `${viewport.height}px`);
    };
    updateViewport();
    viewport?.addEventListener("resize", updateViewport);

    return () => {
      viewport?.removeEventListener("resize", updateViewport);
      dialog.close();
      Object.assign(style, previous);
      window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className={styles.content}>
        <div className={styles.heading}>
          <div><span className={styles.eyebrow}>ОКНО ЩИТ</span><h2 id={`${id}-title`}>Обсудим защиту<br />ваших окон</h2></div>
          <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Закрыть форму обратной связи">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <p className={styles.description} id={`${id}-description`}>Оставьте телефон — специалист перезвонит и поможет подобрать решение.</p>
        <LeadFormClient {...formProps} variant="modal" />
        <p className={styles.alternative}>Или позвоните: <a href={`tel:+${formProps.phone.replace(/\D/g, "")}`}>{formProps.phone}</a></p>
      </div>
    </dialog>
  );
}
