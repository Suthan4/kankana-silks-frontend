"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface CheckoutAccordionCardProps {
  id: string;
  title: string;
  icon: ReactNode;
  badge?: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  isDone?: boolean;
}

export function CheckoutAccordionCard({
  id,
  title,
  icon,
  badge,
  isOpen,
  onToggle,
  children,
  isDone,
}: CheckoutAccordionCardProps) {
  return (
    <section
      data-checkout-section={id}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-2.5"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-gray-50 transition text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <span className="font-futura-bold text-gray-900 text-sm flex-1">
          {title}
        </span>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              isDone
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            }`}
          >
            {isDone && <span aria-hidden="true">✓</span>}
            {badge}
          </span>
        )}
        <span
          aria-hidden="true"
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ⌄
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
