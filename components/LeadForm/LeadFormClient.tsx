"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { CheckIcon } from "@/components/icons";
import { trackSiteGoal } from "@/lib/analytics";
import { createLeadPayload, formatLeadPhone, getFeedbackEndpoint, OBJECT_TYPES, validateLead, type LeadErrors, type LeadValues } from "./feedback";
import styles from "./LeadForm.module.scss";

export type LeadFormClientProps = {
  regionName: string;
  phone: string;
  legalConfigured: boolean;
  consentVersion: string;
  variant?: "inline" | "modal";
};

const initialValues: LeadValues = { name: "", phone: "", object: "", consent: false };
const feedbackEndpoint = getFeedbackEndpoint(process.env.NEXT_PUBLIC_API_URL);
const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function LeadFormClient({ regionName, phone, legalConfigured, consentVersion, variant = "inline" }: LeadFormClientProps) {
  const id = useId();
  const hydrated = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  const [values, setValues] = useState<LeadValues>(initialValues);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const pendingRequest = useRef<AbortController | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const available = legalConfigured && Boolean(feedbackEndpoint);
  const telephone = `tel:+${phone.replace(/\D/g, "")}`;

  useEffect(() => () => {
    pendingRequest.current?.abort();
    pendingRequest.current = null;
  }, []);
  useEffect(() => {
    if (status === "success" || status === "error") feedbackRef.current?.focus({ preventScroll: true });
  }, [status]);

  function update<K extends keyof LeadValues>(field: K, value: LeadValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRequest.current) return;

    const nextErrors = validateLead(values);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      event.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    if (!available || !feedbackEndpoint) {
      setSubmitError("Сейчас отправка заявки недоступна. Данные не отправлены. Пожалуйста, позвоните нам:");
      setStatus("error");
      return;
    }

    const controller = new AbortController();
    pendingRequest.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    setStatus("pending");
    setSubmitError("");
    try {
      const response = await fetch(feedbackEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(createLeadPayload(values, regionName, consentVersion, {
          page: window.location.pathname,
          formPosition: variant,
        })),
        credentials: "omit",
        mode: "cors",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
      });
      if (!response.ok || response.redirected || response.headers.get("content-type")?.includes("text/html")) {
        throw new Error(response.status === 429 ? "rate-limit" : "delivery-failed");
      }
      if (response.headers.get("content-type")?.includes("application/json") && response.status !== 204) {
        const result: unknown = await response.json();
        if (result && typeof result === "object" && (("success" in result && result.success === false) || ("error" in result && result.error))) {
          throw new Error("delivery-failed");
        }
      }
      if (pendingRequest.current !== controller) return;
      setValues(initialValues);
      setStatus("success");
      trackSiteGoal("form_success", { position: variant });
    } catch (error) {
      if (pendingRequest.current !== controller) return;
      setStatus("error");
      setSubmitError(error instanceof Error && error.message === "rate-limit"
        ? "Слишком много попыток. Подождите немного или позвоните нам."
        : "Не удалось подтвердить отправку заявки. Попробуйте ещё раз или позвоните нам.");
      trackSiteGoal("form_error", { position: variant });
    } finally {
      window.clearTimeout(timeout);
      pendingRequest.current = null;
    }
  }

  if (status === "success") {
    return (
      <div className={`${styles.success} ${variant === "modal" ? styles.inModal : ""}`} role="status" tabIndex={-1} ref={feedbackRef}>
        <span className={styles.successIcon} aria-hidden="true"><CheckIcon /></span>
        <div>
          <h3>Заявка отправлена</h3>
          <p>Спасибо! Мы свяжемся с вами и уточним детали расчёта.</p>
          <button type="button" onClick={() => setStatus("idle")}>Отправить ещё одну</button>
        </div>
      </div>
    );
  }

  return (
    <form className={`${styles.form} ${variant === "modal" ? styles.inModal : ""}`} method="post" onSubmit={handleSubmit} noValidate aria-busy={status === "pending"}>
      {!available && status !== "error" && <p className={styles.unavailable}>Онлайн-заявки пока недоступны. Для расчёта позвоните: <a href={telephone} data-call-tracking-id={`${variant}_unavailable`}>{phone}</a>.</p>}
      {available && <noscript><p className={styles.unavailable}>Для отправки формы включите JavaScript или позвоните: <a href={telephone} data-call-tracking-id={`${variant}_noscript`}>{phone}</a>.</p></noscript>}
      <fieldset className={styles.fields} disabled={!hydrated || status === "pending"}>
        <legend className={styles.visuallyHidden}>Данные для обратного звонка</legend>
        <label className={styles.field} htmlFor={`${id}-name`}>
          <span className={styles.label}>Как к вам обращаться <span>(необязательно)</span></span>
          <input className={`${styles.control} ym-disable-keys ${errors.name ? styles.controlError : ""}`} id={`${id}-name`} name="name" type="text" autoComplete="name" placeholder="Ваше имя" maxLength={80} value={values.name} onChange={(event) => update("name", event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${id}-name-error` : undefined} />
          {errors.name && <small className={styles.error} id={`${id}-name-error`}>{errors.name}</small>}
        </label>

        <label className={styles.field} htmlFor={`${id}-phone`}>
          <span className={styles.label}>Номер телефона</span>
          <input className={`${styles.control} ym-disable-keys ${errors.phone ? styles.controlError : ""}`} id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" required maxLength={18} value={values.phone} onChange={(event) => update("phone", formatLeadPhone(event.target.value))} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? `${id}-phone-error` : undefined} />
          {errors.phone && <small className={styles.error} id={`${id}-phone-error`}>{errors.phone}</small>}
        </label>

        <label className={styles.field} htmlFor={`${id}-object`}>
          <span className={styles.label}>Что нужно защитить <span>(необязательно)</span></span>
          <select className={`${styles.control} ${errors.object ? styles.controlError : ""}`} id={`${id}-object`} name="object" value={values.object} onChange={(event) => update("object", event.target.value)} aria-invalid={Boolean(errors.object)} aria-describedby={errors.object ? `${id}-object-error` : undefined}>
            <option value="">Обсудим при звонке</option>
            {OBJECT_TYPES.map((object) => <option key={object}>{object}</option>)}
          </select>
          {errors.object && <small className={styles.error} id={`${id}-object-error`}>{errors.object}</small>}
        </label>

        <div className={styles.consent}>
          <input id={`${id}-consent`} name="consent" type="checkbox" required checked={values.consent} onChange={(event) => update("consent", event.target.checked)} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? `${id}-consent-error` : undefined} />
          <label htmlFor={`${id}-consent`}>Я даю <a href="/personal-data-consent/" target="_blank" rel="noopener noreferrer">согласие на обработку персональных данных</a> для ответа на заявку.</label>
        </div>
        {errors.consent && <small className={styles.error} id={`${id}-consent-error`}>{errors.consent}</small>}
        <p className={styles.policy}>Как мы обрабатываем данные: <a href="/privacy/" target="_blank" rel="noopener noreferrer">политика обработки персональных данных</a>.</p>

        <button className={`button button-dark ${styles.submit}`} type="submit" disabled={status === "pending"}>
          {status === "pending" ? "Отправляем…" : "Получить расчёт"} <span aria-hidden="true">↗</span>
        </button>
      </fieldset>
      {status === "error" && <div className={styles.submitError} role="alert" tabIndex={-1} ref={feedbackRef}>{submitError} <a href={telephone} data-call-tracking-id={`${variant}_error`}>{phone}</a></div>}
      <p className={styles.note}>Согласие на заявку не включает рекламные рассылки и необязательную аналитику.</p>
    </form>
  );
}
