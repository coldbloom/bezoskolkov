import { BrandMark } from "@/components/BrandMark";
import { SITE_NAME } from "@/lib/site";
import styles from "./loading.module.scss";

export default function PageLoading() {
  return (
    <div className={styles.root} role="status" aria-live="polite" aria-busy="true">
      <span className="visually-hidden">Загружаем страницу {SITE_NAME}</span>
      <div className="shell" aria-hidden="true">
        <div className={styles.brand}><BrandMark size={34} /><span>{SITE_NAME}</span></div>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <div className={`${styles.bar} ${styles.label}`} />
            <div className={styles.heading} /><div className={styles.heading} />
            <div className={styles.bar} /><div className={styles.bar} />
            <div className={styles.button} />
          </div>
          <div className={styles.image}><BrandMark size={70} /></div>
        </div>
      </div>
    </div>
  );
}
