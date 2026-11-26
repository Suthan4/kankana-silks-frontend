"use client";

import { useLayoutEffect } from "react";

// A shared, reference-counted lock prevents nested overlays from unlocking
// the page while another dialog or drawer is still open.
const activeLocks = new Set<symbol>();

type LockSnapshot = {
  bodyOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
  scrollX: number;
  scrollY: number;
};

let snapshot: LockSnapshot | null = null;

function isIOSWebKit() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  const touchMac =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return (iOSDevice || touchMac) && /AppleWebKit/.test(ua);
}

function acquireScrollLock() {
  if (typeof document === "undefined") return () => {};

  const token = Symbol("modal-scroll-lock");

  if (activeLocks.size === 0) {
    const body = document.body;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    snapshot = {
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      scrollX,
      scrollY,
    };

    body.style.overflow = "hidden";

    // iOS Safari may continue scrolling the document with overflow:hidden.
    // Pin the body and restore the exact scroll coordinates on final release.
    if (isIOSWebKit()) {
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = `-${scrollX}px`;
      body.style.right = "0";
      body.style.width = "100%";
    }

    body.dataset.modalScrollLocked = "true";
  }

  activeLocks.add(token);

  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeLocks.delete(token);
    if (activeLocks.size !== 0 || !snapshot) return;

    const body = document.body;
    const previous = snapshot;
    snapshot = null;

    body.style.overflow = previous.bodyOverflow;
    body.style.position = previous.bodyPosition;
    body.style.top = previous.bodyTop;
    body.style.left = previous.bodyLeft;
    body.style.right = previous.bodyRight;
    body.style.width = previous.bodyWidth;
    delete body.dataset.modalScrollLocked;

    if (isIOSWebKit()) {
      window.scrollTo(previous.scrollX, previous.scrollY);
    }
  };
}

export function useModalScrollLock(isOpen: boolean) {
  useLayoutEffect(() => {
    if (!isOpen) return;
    return acquireScrollLock();
  }, [isOpen]);
}
