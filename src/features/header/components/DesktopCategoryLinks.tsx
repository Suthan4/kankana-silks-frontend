"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { RefObject } from "react";
import type { Category } from "@/lib/api/category.api";

interface Props {
  categories: Category[];
  loading: boolean;
  hoveredCategory: string | null;
  isHeaderWhite: boolean;
  navRef: RefObject<HTMLElement | null>;
  onHoverCategory: (categoryId: string) => void;
  getCategoryUrl: (slug: string) => string;
  onEscape: () => void;
}

export function DesktopCategoryLinks({
  categories,
  loading,
  hoveredCategory,
  isHeaderWhite,
  navRef,
  onHoverCategory,
  getCategoryUrl,
  onEscape,
}: Props) {
  return (
    <div className="h-10 overflow-hidden">
      <ul className="flex h-10 items-center justify-center gap-2">
        {loading ? (
          [80, 100, 72, 88, 96, 76].map((width, index) => (
            <li key={index} className="px-5">
              <div className="h-3 animate-pulse rounded-full bg-gray-200/70" style={{ width: `${width}px` }} />
            </li>
          ))
        ) : categories.length === 0 ? (
          <li className="text-base text-gray-400">No categories available</li>
        ) : (
          categories.map((category) => {
            const isActive = hoveredCategory === category.id;
            return (
              <li
                key={category.id}
                onMouseEnter={() => onHoverCategory(category.id)}
                className="relative flex h-full items-center"
              >
                <Link
                  href={getCategoryUrl(category.slug)}
                  onFocus={() => onHoverCategory(category.id)}
                  className={`relative flex h-14 items-center px-5 text-sm font-medium uppercase tracking-[0.12em] transition-colors duration-300 ${
                    isHeaderWhite
                      ? isActive ? "text-brand-primary" : "text-black hover:text-brand-primary"
                      : "text-white hover:text-white"
                  }`}
                >
                  {category.name}
                </Link>
                <motion.span
                  aria-hidden="true"
                  initial={false}
                  animate={{
                    width: isActive ? "calc(100% - 32px)" : "10px",
                    opacity: isActive ? 1 : 0.65,
                  }}
                  transition={{
                    width: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.2 },
                  }}
                  className={`pointer-events-none absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 rounded-full ${
                    isHeaderWhite
                      ? "bg-brand-primary"
                      : "bg-white shadow-[0_0_8px_rgba(255,255,255,0.65)]"
                  }`}
                />
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
