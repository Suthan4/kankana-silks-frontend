"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TooltipProps = {
  label: string;
  children: React.ReactNode;
};

export default function Tooltip({ label, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [align, setAlign] = useState<"center" | "left" | "right">("center");

  // 🔍 Detect viewport overflow
  useEffect(() => {
    if (!open || !tooltipRef.current) return;

    const rect = tooltipRef.current.getBoundingClientRect();
    const padding = 12;

    if (rect.left < padding) {
      setAlign("left");
    } else if (rect.right > window.innerWidth - padding) {
      setAlign("right");
    } else {
      setAlign("center");
    }
  }, [open]);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((prev) => !prev)} // mobile tap
    >
      {children}

      <AnimatePresence>
        {open && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`
              absolute z-[9999]
              top-full mt-2
              whitespace-nowrap
              rounded-md bg-black
              px-3 py-1 text-xs text-white shadow-lg
              ${
                align === "center"
                  ? "left-1/2 -translate-x-1/2"
                  : align === "left"
                  ? "left-0"
                  : "right-0"
              }
            `}
          >
            {label}

            {/* Arrow */}
            <span
              className={`
                absolute -top-1 h-2 w-2 rotate-45 bg-black
                ${
                  align === "center"
                    ? "left-1/2 -translate-x-1/2"
                    : align === "left"
                    ? "left-4"
                    : "right-4"
                }
              `}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
