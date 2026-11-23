"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Heart } from "lucide-react";
import { CATEGORY_SORT_OPTIONS } from "../constants";
import type { CategorySortValue } from "../types";

interface CategoryMobileHeaderProps {
  categoryName: string;
  total: number;
  grid: 1 | 2;
  wishlistCount: number;
  sortBy: CategorySortValue;
  onGridChange: (value: 1 | 2) => void;
  onSortChange: (value: CategorySortValue) => void;
}

const SORT_LABELS: Record<string, string> = {
  "createdAt-desc": "Featured",
  "price-asc": "Price ↑",
  "price-desc": "Price ↓",
  "popularity-desc": "Popular",
};

export function CategoryMobileHeader({
  categoryName,
  total,
  grid,
  wishlistCount,
  sortBy,
  onGridChange,
  onSortChange,
}: CategoryMobileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 border-b border-[#eadde0] bg-white/95 shadow-[0_4px_16px_rgba(91,54,67,0.04)] backdrop-blur md:hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href="/shop">
          <motion.div whileTap={{ scale: 0.9 }}>
            <ChevronLeft className="h-6 w-6" />
          </motion.div>
        </Link>
        <div>
          <p className="font-semibold text-gray-900">{categoryName}</p>
          <p className="text-xs text-gray-500">{total} items</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => onGridChange(1)}
            aria-label="Show one product per row"
            className={`border p-1.5 ${grid === 1 ? "border-[#75495a] bg-[#75495a] text-white" : "border-gray-300"}`}
          >
            <div className="grid gap-[2px]">
              <div className="h-[2px] w-3 bg-current" />
              <div className="h-[2px] w-3 bg-current" />
              <div className="h-[2px] w-3 bg-current" />
            </div>
          </button>
          <button
            type="button"
            onClick={() => onGridChange(2)}
            aria-label="Show two products per row"
            className={`border p-1.5 ${grid === 2 ? "border-[#75495a] bg-[#75495a] text-white" : "border-gray-300"}`}
          >
            <div className="grid grid-cols-2 gap-[2px]">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-1.5 w-1.5 bg-current" />
              ))}
            </div>
          </button>
          <motion.div whileTap={{ scale: 0.9 }} className="relative">
            <Link href="/wishlist" className="relative inline-flex">
              <Heart className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </motion.div>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
        {CATEGORY_SORT_OPTIONS.map((option) => (
          <motion.button
            key={option.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSortChange(option.value)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
              sortBy === option.value
                ? "bg-[#75495a] text-white"
                : "border border-gray-300 text-gray-600 hover:border-black"
            }`}
          >
            {SORT_LABELS[option.value]}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
