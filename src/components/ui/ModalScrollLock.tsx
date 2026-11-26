"use client";

import { useModalScrollLock } from "@/hooks/useModalScrollLock";

/**
 * Mount this inside the child managed by AnimatePresence.
 * The lock then lives for the complete visual lifetime of the overlay,
 * including its exit animation, instead of unlocking when isOpen flips false.
 */
export function ModalScrollLock() {
  useModalScrollLock(true);
  return null;
}
