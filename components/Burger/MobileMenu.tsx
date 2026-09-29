"use client";

import { ModalPageWindow } from "@/components/ModalPageWindow";
import { Menu } from "./Menu";
import styles from "./Burger.module.scss";

export default function MobileMenu({ isOpen, onCloseAction }: { isOpen: boolean; onCloseAction: () => void }) {
  return (
    <ModalPageWindow isOpen={isOpen} onCloseAction={onCloseAction} className={styles.modalPage}
      backdropClassName={styles.backdrop} slidePosition="x" exitActiveFast ariaLabelledBy="mobile-menu-title">
      <Menu onCloseAction={onCloseAction} />
    </ModalPageWindow>
  );
}
