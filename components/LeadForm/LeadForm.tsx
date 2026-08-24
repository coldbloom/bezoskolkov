"use client";

import { useState, type ChangeEvent, type FormEvent, type FocusEvent } from "react";
import { CheckIcon } from "@/components/icons";
import styles from "./LeadForm.module.scss";

type FormData = {
  name: string;
  phone: string;
  object: string;
};

type FormField = keyof FormData;
type FormErrors = Partial<Record<FormField, string>>;
type TouchedFields = Partial<Record<FormField, boolean>>;

const initialFormData: FormData = {
  name: "",
  phone: "",
  object: "",
};

function formatPhone(rawValue: string) {
  const digits = rawValue.replace(/\D/g, "");
  let localDigits = digits;

  if (localDigits.startsWith("7") || localDigits.startsWith("8")) {
    localDigits = localDigits.slice(1);
  }

  localDigits = localDigits.slice(0, 10);

  if (localDigits.length === 0) {
    return "+7 ";
  }

  let formatted = `+7 (${localDigits.slice(0, 3)}`;

  if (localDigits.length >= 4) {
    formatted += `) ${localDigits.slice(3, 6)}`;
  }
  if (localDigits.length >= 7) {
    formatted += `-${localDigits.slice(6, 8)}`;
  }
  if (localDigits.length >= 9) {
    formatted += `-${localDigits.slice(8, 10)}`;
  }

  return formatted;
}

function validateField(field: FormField, value: string) {
  if (field === "name" && value.trim().length < 2) {
    return "Введите имя — минимум 2 символа";
  }

  if (field === "phone" && value.replace(/\D/g, "").length !== 11) {
    return "Введите номер телефона полностью";
  }

  if (field === "object" && !value) {
    return "Выберите объект для расчёта";
  }

  return undefined;
}

function validateForm(formData: FormData) {
  return (Object.keys(formData) as FormField[]).reduce<FormErrors>((errors, field) => {
    const error = validateField(field, formData[field]);

    if (error) {
      errors[field] = error;
    }

    return errors;
  }, {});
}

export function LeadForm({ regionName, phone }: { regionName: string; phone: string }) {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  function updateField(field: FormField, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));

    if (touched[field]) {
      setErrors((current) => ({ ...current, [field]: validateField(field, value) }));
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const field = event.currentTarget.name as FormField;
    const value = field === "phone" ? formatPhone(event.currentTarget.value) : event.currentTarget.value;

    updateField(field, value);
  }

  function handleBlur(field: FormField, value: string) {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, [field]: validateField(field, value) }));
  }

  function handlePhoneFocus(event: FocusEvent<HTMLInputElement>) {
    const input = event.currentTarget;

    if (!formData.phone) {
      updateField("phone", "+7 ");
    }

    requestAnimationFrame(() => {
      if (!input.isConnected) return;

      const position = input.value.length;
      input.setSelectionRange(position, position);
    });
  }

  function handlePhoneBlur() {
    const normalizedPhone = formData.phone.trim() === "+7" ? "" : formData.phone;

    if (normalizedPhone !== formData.phone) {
      setFormData((current) => ({ ...current, phone: normalizedPhone }));
    }

    handleBlur("phone", normalizedPhone);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm(formData);

    setTouched({ name: true, phone: true, object: true });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSent(true);
  }

  function resetForm() {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setSent(false);
  }

  if (sent) {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon}><CheckIcon /></span>
        <div>
          <h3>Заявка подготовлена</h3>
          <p>Спасибо! Для подключения реальной отправки укажите CRM или почтовый сервис. Сейчас быстрее всего позвонить по номеру {phone}.</p>
          <button type="button" onClick={resetForm}>Отправить ещё одну</button>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className={styles.field} htmlFor="lead-name">
        <span className={styles.label}>Как к вам обращаться</span>
        <input
          className={`${styles.control} ${errors.name ? styles.controlError : ""}`}
          id="lead-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Ваше имя"
          required
          value={formData.name}
          onChange={handleChange}
          onBlur={() => handleBlur("name", formData.name)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "lead-name-error" : undefined}
        />
        {errors.name && <small className={styles.error} id="lead-name-error">{errors.name}</small>}
      </label>

      <label className={styles.field} htmlFor="lead-phone">
        <span className={styles.label}>Номер телефона</span>
        <input
          className={`${styles.control} ${errors.phone ? styles.controlError : ""}`}
          id="lead-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 (___) ___-__-__"
          required
          value={formData.phone}
          onChange={handleChange}
          onFocus={handlePhoneFocus}
          onBlur={handlePhoneBlur}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "lead-phone-error" : undefined}
        />
        {errors.phone && <small className={styles.error} id="lead-phone-error">{errors.phone}</small>}
      </label>

      <label className={styles.field} htmlFor="lead-object">
        <span className={styles.label}>Что нужно защитить</span>
        <select
          className={`${styles.control} ${errors.object ? styles.controlError : ""}`}
          id="lead-object"
          name="object"
          required
          value={formData.object}
          onChange={handleChange}
          onBlur={() => handleBlur("object", formData.object)}
          aria-invalid={Boolean(errors.object)}
          aria-describedby={errors.object ? "lead-object-error" : undefined}
        >
          <option value="" disabled>Выберите объект</option>
          <option>Квартира</option>
          <option>Частный дом</option>
          <option>Офис</option>
          <option>Коммерческое помещение</option>
          <option>Другой объект</option>
        </select>
        {errors.object && <small className={styles.error} id="lead-object-error">{errors.object}</small>}
      </label>

      <input type="hidden" name="region" value={regionName} />
      <button className={`button button-dark ${styles.submit}`} type="submit">
        Получить расчёт <span aria-hidden="true">↗</span>
      </button>
      <p className={styles.note}>Нажимая кнопку, вы соглашаетесь на обработку данных для связи по заявке.</p>
    </form>
  );
}
