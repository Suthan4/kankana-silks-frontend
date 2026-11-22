"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Open dialogs, most recent last. Only the top-most one reacts to Esc and Tab,
 * so a confirm dialog opened over a drawer closes alone and never traps focus
 * in the layer underneath.
 */
const dialogStack: symbol[] = [];

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => el.getClientRects().length > 0);
}

type UseDialogOptions = {
  isOpen: boolean;
  onClose: () => void;
  /** Element to focus first. Defaults to the first focusable, else the dialog. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Lock page scroll while open (shares the existing useModalScrollLock). */
  lockScroll?: boolean;
  closeOnEscape?: boolean;
};

/**
 * Gives any existing modal / drawer the behaviour the WAI-ARIA dialog pattern
 * requires, WITHOUT changing its markup or animation:
 *
 *  - moves focus inside on open, and back to the trigger on close
 *  - keeps Tab / Shift+Tab inside the dialog
 *  - closes on Esc
 *  - locks page scroll
 *
 * Usage:
 *   const { ref, dialogProps } = useDialog<HTMLDivElement>({ isOpen, onClose });
 *   <div ref={ref} {...dialogProps} aria-labelledby="title-id"> ... </div>
 */
export function useDialog<T extends HTMLElement>({
  isOpen,
  onClose,
  initialFocusRef,
  lockScroll = true,
  closeOnEscape = true,
}: UseDialogOptions) {
  const ref = useRef<T>(null);

  // Keep the latest onClose without re-running the effect (and re-stealing
  // focus) every time the parent re-renders with a new inline callback.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useModalScrollLock(isOpen && lockScroll);

  useEffect(() => {
    if (!isOpen) return;

    const token = Symbol("dialog");
    dialogStack.push(token);
    const isTopmost = () => dialogStack[dialogStack.length - 1] === token;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    // Wait one frame so the dialog (and any enter animation) is in the DOM.
    const frame = window.requestAnimationFrame(() => {
      const container = ref.current;
      if (!container) return;
      const target =
        initialFocusRef?.current ?? getFocusable(container)[0] ?? container;
      target.focus({ preventScroll: true });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTopmost()) return;

      if (event.key === "Escape" && closeOnEscape) {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const container = ref.current;
      if (!container) return;

      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (!container.contains(active)) {
        // Focus escaped (e.g. clicked the backdrop): pull it back in.
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      const index = dialogStack.indexOf(token);
      if (index !== -1) dialogStack.splice(index, 1);
      // Return focus to whatever opened the dialog, if it still exists.
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [isOpen, closeOnEscape, initialFocusRef]);

  return {
    ref,
    /** Spread on the dialog element. Add aria-labelledby / aria-label yourself. */
    dialogProps: {
      role: "dialog" as const,
      "aria-modal": true as const,
      tabIndex: -1,
    },
  };
}