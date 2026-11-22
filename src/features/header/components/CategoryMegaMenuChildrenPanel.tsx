"use client";

import Link from "next/link";
import type { Category } from "@/lib/api/category.api";
import { CategoryMegaMenuImageRail } from "./CategoryMegaMenuImageRail";
import { CategoryMegaMenuSubcategoryGrid } from "./CategoryMegaMenuSubcategoryGrid";
import { CategoryMegaMenuTextColumns } from "./CategoryMegaMenuTextColumns";

interface Props {
  category: Category;
  activeCategoryImages: Category[];
  hasCategoryImages: boolean;
  useVerticalCategoryList: boolean;
  shouldUseGrid: boolean;
  balancedTextColumns: Category[][];
  maxHeight: string;
  getCategoryUrl: (slug: string) => string;
  onNavigate: () => void;
}

export function CategoryMegaMenuChildrenPanel({
  category,
  activeCategoryImages,
  hasCategoryImages,
  useVerticalCategoryList,
  shouldUseGrid,
  balancedTextColumns,
  maxHeight,
  getCategoryUrl,
  onNavigate,
}: Props) {
  return (
    <div
      style={{ maxHeight }}
      className={`grid overflow-hidden ${
        !hasCategoryImages
          ? "grid-cols-1"
          : useVerticalCategoryList
            ? "min-h-[445px] grid-cols-[280px_minmax(0,1fr)]"
            : "min-h-[445px] grid-cols-[minmax(380px,1fr)_minmax(700px,900px)]"
      }`}
    >
      <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        <div
          className={
            !hasCategoryImages
              ? "h-[440px] overflow-y-auto px-8 py-7 lg:px-10 2xl:h-[470px]"
              : useVerticalCategoryList
                ? "min-h-0 flex-1 overflow-y-auto px-10 py-9"
                : "min-h-0 flex-1 overflow-y-auto px-8 py-9 lg:px-10"
          }
        >
          {!hasCategoryImages ? (
            <CategoryMegaMenuTextColumns
              columns={balancedTextColumns}
              getCategoryUrl={getCategoryUrl}
              onNavigate={onNavigate}
            />
          ) : (
            <CategoryMegaMenuSubcategoryGrid
              category={category}
              useVerticalCategoryList={useVerticalCategoryList}
              shouldUseGrid={shouldUseGrid}
              getCategoryUrl={getCategoryUrl}
              onNavigate={onNavigate}
            />
          )}
        </div>

        <div className="sticky bottom-0 z-10 shrink-0 border-t border-gray-200 bg-white px-10 py-4">
          <Link
            href={getCategoryUrl(category.slug)}
            onClick={onNavigate}
            className="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-black"
          >
            <span className="border-b border-transparent transition-colors duration-200 group-hover:border-black">
              View All
            </span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      {hasCategoryImages && (
        <CategoryMegaMenuImageRail
          categories={activeCategoryImages}
          getCategoryUrl={getCategoryUrl}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
