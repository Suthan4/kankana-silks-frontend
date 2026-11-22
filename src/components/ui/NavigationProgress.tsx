"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const TRICKLE_MS = 200;
const FAILSAFE_MS = 15_000;
const FINISH_MS = 250;

/**
 * Thin progress bar at the top of the viewport while a page navigation is in
 * flight. Dependency-free.
 *
 * START: a capture-phase click listener sees clicks on same-origin links that
 *        lead to a different path or query (next/link renders plain <a>).
 * FINISH: the URL (pathname or search) actually changed, i.e. the new route
 *        has committed. A failsafe finishes the bar if navigation never lands.
 *
 * It is decorative (aria-hidden): sighted users get feedback, and screen
 * readers already get the new page title / focus handling from Next.js.
 * Programmatic router.push() calls don't show the bar; navigation that
 * matters should be a <Link>, which is what the refactor converts them to.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const activeRef = useRef(false);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const failsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (trickleRef.current) clearInterval(trickleRef.current);
    if (failsafeRef.current) clearTimeout(failsafeRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
    trickleRef.current = null;
    failsafeRef.current = null;
    hideRef.current = null;
  }, []);

  const finish = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    clearTimers();
    setProgress(100);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, FINISH_MS);
  }, [clearTimers]);

  const start = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    clearTimers();
    setVisible(true);
    setProgress(8);
    // Ease towards 90% and wait there until the route commits.
    trickleRef.current = setInterval(() => {
      setProgress((p) => (p < 90 ? p + (90 - p) * 0.1 : p));
    }, TRICKLE_MS);
    failsafeRef.current = setTimeout(finish, FAILSAFE_MS);
  }, [clearTimers, finish]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor || !anchor.getAttribute("href")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Same page (or hash-only jump): nothing will load.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      start();
    };

    // Capture phase, so we see the click before next/link calls preventDefault.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  // The route committed: complete the bar.
  useEffect(() => {
    finish();
  }, [pathname, searchParams, finish]);

  // Clear timers on unmount.
  useEffect(() => clearTimers, [clearTimers]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[10001] h-[3px]"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FINISH_MS}ms ease`,
      }}
    >
      <div
        className="h-full bg-main-primary"
        style={{
          width: `${progress}%`,
          transition: "width 200ms ease-out",
        }}
      />
    </div>
  );
}
