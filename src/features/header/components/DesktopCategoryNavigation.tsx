"use client";

import { motion } from "framer-motion";
import type { RefObject } from "react";
import type { Category } from "@/lib/api/category.api";
import { DesktopCategoryLinks } from "./DesktopCategoryLinks";
import { CategoryMegaMenu } from "./CategoryMegaMenu";

interface Props {
  navRef: RefObject<HTMLElement | null>;
  showNav: boolean;
  categories: Category[];
  loading: boolean;
  hoveredCategory: string | null;
  setHoveredCategory: (categoryId: string | null) => void;
  isHeaderWhite: boolean;
  activeCategory: Category | undefined;
  activeCategoryImages: Category[];
  hasCategoryImages: boolean;
  useVerticalCategoryList: boolean;
  shouldUseGrid: boolean;
  balancedTextColumns: Category[][];
  navBottom: number;
  onHoverCategory: (categoryId: string) => void;
  getCategoryUrl: (slug: string) => string;
}

export function DesktopCategoryNavigation({
  navRef, showNav, categories, loading, hoveredCategory,
  setHoveredCategory, isHeaderWhite, activeCategory,
  activeCategoryImages, hasCategoryImages, useVerticalCategoryList,
  shouldUseGrid, balancedTextColumns, navBottom, onHoverCategory,
  getCategoryUrl,
}: Props) {
  return (
    <motion.nav
      ref={navRef}
      data-testid="desktop-nav"
      aria-label="Main"
      initial={false}
      animate={{ opacity: showNav ? 1 : 0, y: showNav ? 0 : -6 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setHoveredCategory(null);
      }}
      style={{ height: showNav ? 42 : 0 }}
      className={`relative z-40 hidden md:block ${
        showNav ? "pointer-events-auto overflow-visible" : "pointer-events-none overflow-hidden"
      }`}
    >
      <DesktopCategoryLinks
        categories={categories}
        loading={loading}
        hoveredCategory={hoveredCategory}
        isHeaderWhite={isHeaderWhite}
        navRef={navRef}
        onHoverCategory={onHoverCategory}
        getCategoryUrl={getCategoryUrl}
        onEscape={() => setHoveredCategory(null)}
      />
      <CategoryMegaMenu
        open={Boolean(hoveredCategory && activeCategory)}
        category={activeCategory}
        navBottom={navBottom}
        activeCategoryImages={activeCategoryImages}
        hasCategoryImages={hasCategoryImages}
        useVerticalCategoryList={useVerticalCategoryList}
        shouldUseGrid={shouldUseGrid}
        balancedTextColumns={balancedTextColumns}
        getCategoryUrl={getCategoryUrl}
        onClose={() => setHoveredCategory(null)}
      />
    </motion.nav>
  );
}
