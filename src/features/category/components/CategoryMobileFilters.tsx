"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, SlidersHorizontal } from "lucide-react";
import type { Category } from "@/lib/api/category.api";
import { CategoryFilterSidebar } from "./CategoryFilterSidebar";

interface CategoryMobileFiltersProps {
  open: boolean;
  total: number;
  category: Category;
  selectedSubCategory: string | null;
  priceRange: [number, number];
  selectedFabric: string[];
  materials: readonly string[];
  onOpen: () => void;
  onClose: () => void;
  onSubCategoryChange: (id: string | null) => void;
  onClearFilters: () => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onFabricChange: (material: string) => void;
}

export function CategoryMobileFilters({
  open,
  total,
  category,
  selectedSubCategory,
  priceRange,
  selectedFabric,
  materials,
  onOpen,
  onClose,
  onSubCategoryChange,
  onClearFilters,
  onPriceRangeChange,
  onFabricChange,
}: CategoryMobileFiltersProps) {
  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 380, damping: 30 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onOpen}
        className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 bg-black px-7 py-3 text-xs uppercase tracking-widest text-white shadow-lg md:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filter & Sort
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="ios-modal-backdrop ios-modal-motion fixed inset-0 z-50 bg-black/50 md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="ios-modal-panel ios-filter-sheet ios-modal-motion fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto bg-white md:hidden"
            >
              <div className="sticky top-0 flex items-center justify-between border-b bg-white px-5 py-4">
                <span className="text-xs font-medium uppercase tracking-widest">Filter & Sort</span>
                <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={onClose} aria-label="Close filters">
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              <CategoryFilterSidebar
                isMobile
                category={category}
                selectedSubCategory={selectedSubCategory}
                onSubCategoryChange={onSubCategoryChange}
                onClearFilters={onClearFilters}
                priceRange={priceRange}
                onPriceRangeChange={onPriceRangeChange}
                materials={materials}
                selectedFabric={selectedFabric}
                onFabricChange={onFabricChange}
              />
              <div className="sticky bottom-0 border-t bg-white p-5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full bg-black py-3.5 text-xs uppercase tracking-widest text-white"
                >
                  Show {total} Results
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
