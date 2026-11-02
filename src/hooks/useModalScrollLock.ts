"use client";

import { useLayoutEffect } from "react";

// All overlays share one scroll lock. A Set prevents one modal from unlocking
// the page while another modal/drawer is still open.
const activeLocks = new Set<symbol>();
let originalBodyOverflow = "";

function acquireScrollLock() {
  if (typeof document === "undefined") return () => {};

  const token = Symbol("modal-scroll-lock");

  if (activeLocks.size === 0) {
    const body = document.body;
    originalBodyOverflow = body.style.overflow;

    // Lock before the browser paints the opened overlay. The document reserves
    // scrollbar space in globals.css, so no compensating padding is needed.
    body.style.overflow = "hidden";
    body.dataset.modalScrollLocked = "true";
  }

  activeLocks.add(token);

  return () => {
    activeLocks.delete(token);
    if (activeLocks.size !== 0) return;

    const body = document.body;
    body.style.overflow = originalBodyOverflow;
    delete body.dataset.modalScrollLocked;
  };
}

export function useModalScrollLock(isOpen: boolean) {
  useLayoutEffect(() => {
    if (!isOpen) return;
    return acquireScrollLock();
  }, [isOpen]);
}
