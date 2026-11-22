"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Category } from "@/lib/api/category.api";
import { CategoryMegaMenuChildrenPanel } from "./CategoryMegaMenuChildrenPanel";
import { CategoryMegaMenuLeafPanel } from "./CategoryMegaMenuLeafPanel";

interface Props {
  open: boolean;
  category: Category | undefined;
  navBottom: number;
  activeCategoryImages: Category[];
  hasCategoryImages: boolean;
  useVerticalCategoryList: boolean;
  shouldUseGrid: boolean;
  balancedTextColumns: Category[][];
  getCategoryUrl: (slug: string) => string;
  onClose: () => void;
}

export function CategoryMegaMenu({
  open,
  category,
  navBottom,
  activeCategoryImages,
  hasCategoryImages,
  useVerticalCategoryList,
  shouldUseGrid,
  balancedTextColumns,
  getCategoryUrl,
  onClose,
}: Props) {
  const maxHeight = navBottom > 0
    ? `calc(100dvh - ${navBottom}px)`
    : "calc(100dvh - 150px)";

  return (
    <AnimatePresence>
      {open && category && (
        <>
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="pointer-events-none absolute inset-x-0 top-full z-40 h-screen bg-black/30"
      />
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxHeight }}
        className="absolute inset-x-0 top-full z-50 overflow-hidden border-t border-gray-200 bg-white text-black shadow-xl"
      >
        <div style={{ maxHeight }} className="mx-auto w-full max-w-[1600px] overflow-hidden">
          {category.children && category.children.length > 0 ? (
            <CategoryMegaMenuChildrenPanel
              category={category}
              activeCategoryImages={activeCategoryImages}
              hasCategoryImages={hasCategoryImages}
              useVerticalCategoryList={useVerticalCategoryList}
              shouldUseGrid={shouldUseGrid}
              balancedTextColumns={balancedTextColumns}
              maxHeight={maxHeight}
              getCategoryUrl={getCategoryUrl}
              onNavigate={onClose}
            />
          ) : (
            <CategoryMegaMenuLeafPanel
              category={category}
              maxHeight={maxHeight}
              getCategoryUrl={getCategoryUrl}
              onNavigate={onClose}
            />
          )}
        </div>
      </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
