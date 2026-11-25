"use client";

import { useEffect, useRef } from "react";

type OutsidePointerEvent = PointerEvent;

/**
 * Closes an open overlay when a pointer starts outside its panel.
 * A single pointer event avoids duplicate close calls from the old
 * mouse + touch + pointer listeners on touch-enabled browsers.
 */
export function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: OutsidePointerEvent) => void,
  enabled = true,
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: PointerEvent) => {
      const element = ref.current;
      if (!element || element.contains(event.target as Node)) return;
      handlerRef.current(event);
    };

    document.addEventListener("pointerdown", listener, true);
    return () => {
      document.removeEventListener("pointerdown", listener, true);
    };
  }, [ref, enabled]);
}
