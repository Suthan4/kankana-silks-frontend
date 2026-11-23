"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Portal } from "./Portal";
import { useToastStore } from "@/store/useToastStore";

const styles = {
  success: "brand-status-success",
  error: "brand-status-error",
  info: "brand-status-info",
  warning: "brand-status-warning",
};

export function ToastContainer() {
  const { toasts, removeToast, pauseToast, resumeToast } = useToastStore();

  return (
    <Portal>
      <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[9999] flex flex-col gap-2 sm:w-[360px]">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => pauseToast(toast.id)}
              onMouseLeave={() => resumeToast(toast.id)}
              onTouchStart={() => pauseToast(toast.id)}
              onTouchEnd={() => resumeToast(toast.id)}
              className={`rounded-xl border px-4 py-3 shadow-brand-soft text-sm font-medium flex items-start justify-between gap-3 ${
                styles[toast.type]
              }`}
            >
              <span>{toast.message}</span>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-md px-1 text-current opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-offset-4"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Portal>
  );
}
