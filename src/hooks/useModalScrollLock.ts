"use client";

import { useEffect } from "react";

// All overlays share one scroll lock. A Set prevents one modal from unlocking
// the page while another modal/drawer is still open.
const activeLocks = new Set<symbol>();
let originalBodyOverflow = "";
let originalBodyPaddingRight = "";

function acquireScrollLock() {
  if (typeof document === "undefined") return () => {};

  const token = Symbol("modal-scroll-lock");

  if (activeLocks.size === 0) {
    const body = document.body;
    originalBodyOverflow = body.style.overflow;
    originalBodyPaddingRight = body.style.paddingRight;

    // Compensate for a desktop scrollbar disappearing when overflow is locked.
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const currentPadding = Number.parseFloat(
      window.getComputedStyle(body).paddingRight,
    ) || 0;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
    body.dataset.modalScrollLocked = "true";
  }

  activeLocks.add(token);

  return () => {
    activeLocks.delete(token);
    if (activeLocks.size !== 0) return;

    const body = document.body;
    body.style.overflow = originalBodyOverflow;
    body.style.paddingRight = originalBodyPaddingRight;
    delete body.dataset.modalScrollLocked;
  };
}

export function useModalScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;
    return acquireScrollLock();
  }, [isOpen]);
}
