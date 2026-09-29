import { PhoneIcon } from "@/components/icons";
import { formatPhone, phoneHref } from "@/lib/site";
import styles from "./MobileCall.module.scss";

export function MobileCall({ phone }: { phone: string }) {
  return (
    <a
      className={styles.root}
      href={phoneHref(phone)}
      aria-label={`Позвонить ${formatPhone(phone)}`}
      data-analytics-goal="phone_click"
      data-cta-position="mobile_fixed"
    >
      <PhoneIcon />
      <span>Позвонить</span>
    </a>
  );
}
