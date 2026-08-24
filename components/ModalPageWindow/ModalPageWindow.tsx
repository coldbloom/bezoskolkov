'use client'

import React, { CSSProperties, ReactNode, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { usePortalContainer } from './usePortalContainer';
import { createPortal } from 'react-dom';

import cn from "clsx";
import s from './ModalPageWindow.module.scss';

type ModalPageWindowProps = {
  children: ReactNode;
  isOpen: boolean;
  onCloseAction?: () => void;
  exitActiveFast?: boolean;
  slidePosition?: 'x' | 'y';

  className?: string;
  backdropClassName?: string;
  style?: CSSProperties;
};

export const ModalPageWindow = ({
  children,
  isOpen,
  onCloseAction,
  exitActiveFast = false,
  slidePosition = 'y',
  className,
  backdropClassName,
  style = {}
}: ModalPageWindowProps) => {
  const container = usePortalContainer('modal-window');
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const transitionClasses = slidePosition === 'x'
    ? {
      enter: s['slide-in-enter-x'],
      enterActive: s['slide-in-enter-active-x'],
      exit: s['slide-out-x'],
      exitActive: exitActiveFast ? s['side-out-active-fast-x'] : s['slide-out-active-x']
    }
    : {
      enter: s['slide-in-enter'],
      enterActive: s['slide-in-enter-active'],
      exit: s['slide-out'],
      exitActive: exitActiveFast ? s['side-out-active-fast'] : s['slide-out-active']
    };

  useEffect(() => {
    const handleBodyOverflow = () => {
      document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    };

    handleBodyOverflow();

    return () => {
      document.body.style.overflow = 'auto'; // Reset on component unmount
    };
  }, [isOpen]);

  return (
    container &&
    createPortal(
      <>
        <CSSTransition
          nodeRef={backdropRef}
          in={isOpen}
          timeout={300}
          // компонент будет удален из DOM после завершения анимации выхода
          unmountOnExit
          classNames={{
            enter: s['backdrop-enter'],
            enterActive: s['backdrop-enter-active'],
            exit: s['backdrop-exit'],
            exitActive: s['backdrop-exit-active']
          }}
        >
          <div ref={backdropRef} className={cn(s.backdrop, backdropClassName)} onClick={onCloseAction} />
        </CSSTransition>

        <CSSTransition
          nodeRef={modalRef}
          in={isOpen}
          timeout={300}
          unmountOnExit
          classNames={transitionClasses}
        >
          <div ref={modalRef} className={cn(s.modal, className)} style={{ ...style }}>
            {children}
          </div>
        </CSSTransition>
      </>,
      container
    )
  );
};