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
  ariaLabelledBy?: string;
};

export const ModalPageWindow = ({
  children,
  isOpen,
  onCloseAction,
  exitActiveFast = false,
  slidePosition = 'y',
  className,
  backdropClassName,
  style = {},
  ariaLabelledBy,
}: ModalPageWindowProps) => {
  const container = usePortalContainer('modal-window');
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const transitionClasses = slidePosition === 'x'
    ? {
      appear: s['slide-in-enter-x'],
      appearActive: s['slide-in-enter-active-x'],
      appearDone: s['slide-in-enter-done-x'],
      enter: s['slide-in-enter-x'],
      enterActive: s['slide-in-enter-active-x'],
      enterDone: s['slide-in-enter-done-x'],
      exit: s['slide-out-x'],
      exitActive: exitActiveFast ? s['side-out-active-fast-x'] : s['slide-out-active-x']
    }
    : {
      appear: s['slide-in-enter'],
      appearActive: s['slide-in-enter-active'],
      appearDone: s['slide-in-enter-done'],
      enter: s['slide-in-enter'],
      enterActive: s['slide-in-enter-active'],
      enterDone: s['slide-in-enter-done'],
      exit: s['slide-out'],
      exitActive: exitActiveFast ? s['side-out-active-fast'] : s['slide-out-active']
    };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !container) return;

    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const modal = modalRef.current;
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const focusFirstElement = () => {
      const firstFocusable = modal?.querySelector<HTMLElement>(focusableSelector);
      (firstFocusable || modal)?.focus();
    };

    const animationFrame = requestAnimationFrame(focusFirstElement);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseAction?.();
        return;
      }

      if (event.key !== 'Tab' || !modal) return;

      const focusableElements = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        event.preventDefault();
        modal.focus();
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener('keydown', handleKeyDown);

      if (returnFocusRef.current?.isConnected) {
        returnFocusRef.current.focus();
      }
    };
  }, [isOpen, onCloseAction, container]);

  return (
    container &&
    createPortal(
      <>
        <CSSTransition
          nodeRef={backdropRef}
          in={isOpen}
          appear
          timeout={200}
          // компонент будет удален из DOM после завершения анимации выхода
          unmountOnExit
          classNames={{
            appear: s['backdrop-enter'],
            appearActive: s['backdrop-enter-active'],
            appearDone: s['backdrop-enter-done'],
            enter: s['backdrop-enter'],
            enterActive: s['backdrop-enter-active'],
            enterDone: s['backdrop-enter-done'],
            exit: s['backdrop-exit'],
            exitActive: s['backdrop-exit-active']
          }}
        >
          <div ref={backdropRef} className={cn(s.backdrop, backdropClassName)} onClick={onCloseAction} aria-hidden="true" />
        </CSSTransition>

        <CSSTransition
          nodeRef={modalRef}
          in={isOpen}
          appear
          timeout={300}
          unmountOnExit
          classNames={transitionClasses}
        >
          <div
            ref={modalRef}
            className={cn(s.modal, slidePosition === 'x' && s.horizontal, className)}
            style={{ ...style }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            inert={!isOpen}
            tabIndex={-1}
          >
            {children}
          </div>
        </CSSTransition>
      </>,
      container
    )
  );
};
