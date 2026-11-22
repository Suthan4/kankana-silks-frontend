"use client";

import type { RefObject } from "react";
import { ChevronLeft, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import SortDropdown from "@/components/customDropdown";
import type { Category } from "@/lib/api/category.api";
import type { CategorySortValue } from "../types";

interface CategoryDesktopToolbarProps {
  category: Category;
  total: number;
  selectedSubCategory: string | null;
  showLeftArrow: boolean;
  showRightArrow: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
  gridCols: 2 | 3 | 4;
  filterOpen: boolean;
  sortBy: CategorySortValue;
  onSubCategoryChange: (id: string | null) => void;
  onScrollCategories: (direction: "left" | "right") => void;
  onGridChange: (value: 2 | 3 | 4) => void;
  onFilterToggle: () => void;
  onSortChange: (value: CategorySortValue) => void;
}

export function CategoryDesktopToolbar({
  category,
  total,
  selectedSubCategory,
  showLeftArrow,
  showRightArrow,
  scrollRef,
  gridCols,
  filterOpen,
  sortBy,
  onSubCategoryChange,
  onScrollCategories,
  onGridChange,
  onFilterToggle,
  onSortChange,
}: CategoryDesktopToolbarProps) {
  return (
    <div className="hidden items-center justify-between border-b border-gray-100 px-8 py-3 md:flex xl:px-10">
      <div className="flex items-center gap-4">
        <Link href="/shop" className="text-xs uppercase tracking-widest text-gray-400 transition-colors hover:text-black">
          Shop
        </Link>
        <span className="text-gray-200">›</span>
        <h1 className="text-sm font-medium uppercase tracking-widest text-black">{category.name}</h1>
        <span className="text-xs tracking-wide text-gray-400">
          {total > 0 ? `${total} sarees` : ""}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {category.children?.length ? (
          <div className="relative flex max-w-[720px] items-center">
            {showLeftArrow && (
              <button
                type="button"
                onClick={() => onScrollCategories("left")}
                aria-label="Scroll subcategories left"
                className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-xl transition hover:border-black"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div ref={scrollRef} className="flex scroll-smooth items-center gap-1.5 overflow-x-auto px-10 scrollbar-none">
              <button
                type="button"
                onClick={() => onSubCategoryChange(null)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs uppercase tracking-widest transition-colors ${
                  selectedSubCategory === null
                    ? "border-black bg-black text-white"
                    : "border-gray-300 text-gray-600 hover:border-black hover:text-black"
                }`}
              >
                All
              </button>
              {category.children.map((subCategory) => (
                <button
                  type="button"
                  key={subCategory.id}
                  onClick={() => onSubCategoryChange(subCategory.id)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs uppercase tracking-widest transition-colors ${
                    selectedSubCategory === subCategory.id
                      ? "border-black bg-black text-white"
                      : "border-gray-300 text-gray-600 hover:border-black hover:text-black"
                  }`}
                >
                  {subCategory.name}
                </button>
              ))}
            </div>
            {showRightArrow && (
              <button
                type="button"
                onClick={() => onScrollCategories("right")}
                aria-label="Scroll subcategories right"
                className="absolute right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-xl transition hover:border-black"
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </button>
            )}
          </div>
        ) : null}

        {category.children?.length ? <span className="h-4 w-px bg-gray-200" /> : null}
        <div className="mr-2 hidden items-center gap-1 border-r border-gray-200 pr-4 md:flex">
          {[2, 3, 4].map((columns) => (
            <button
              key={columns}
              type="button"
              onClick={() => onGridChange(columns as 2 | 3 | 4)}
              aria-label={`Show ${columns} grid columns`}
              className={`border p-2 transition-colors ${
                gridCols === columns
                  ? "border-black bg-black text-white"
                  : "border-gray-300 text-gray-500 hover:border-black hover:text-black"
              }`}
            >
              <span className={`grid gap-[2px] ${columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
                {Array.from({ length: columns * columns }).map((_, index) => (
                  <span key={index} className={columns === 4 ? "h-1 w-1 bg-current" : "h-1.5 w-1.5 bg-current"} />
                ))}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onFilterToggle}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs uppercase tracking-widest transition-colors ${
            filterOpen
              ? "border-black bg-black text-white"
              : "border-gray-300 text-gray-600 hover:border-black hover:text-black"
          }`}
        >
          <SlidersHorizontal className="h-3 w-3" />
          Filter
        </button>
        <SortDropdown value={sortBy} onChange={(value) => onSortChange(value as CategorySortValue)} />
      </div>
    </div>
  );
}
