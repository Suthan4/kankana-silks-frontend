"use client";

import { useMemo } from "react";
import type { Category } from "@/lib/api/category.api";

export function useHeaderMegaMenuModel(
  categories: Category[],
  hoveredCategory: string | null,
) {
  const activeCategory = categories.find((item) => item.id === hoveredCategory);
  const activeCategoryImages =
    activeCategory?.children?.filter((child) => Boolean(child.image)) ?? [];
  const hasCategoryImages =
    activeCategoryImages.length > 0 && (activeCategory?.children?.length ?? 0) < 4;
  const hasGrandchildren =
    activeCategory?.children?.some(
      (child) => child.children && child.children.length > 0,
    ) ?? false;
  const useVerticalCategoryList = !hasGrandchildren;

  const balancedTextColumns = useMemo(() => {
    const children = activeCategory?.children ?? [];
    if (hasCategoryImages || children.length === 0) return [];

    const columnCount = Math.min(5, children.length);
    const columns: Array<{ items: Category[]; estimatedHeight: number }> =
      Array.from({ length: columnCount }, () => ({
        items: [],
        estimatedHeight: 0,
      }));

    children.forEach((category) => {
      const grandchildrenCount = category.children?.length ?? 0;
      const estimatedHeight = 48 + grandchildrenCount * 36 + 28;
      const shortestColumn = columns.reduce((shortest, current) =>
        current.estimatedHeight < shortest.estimatedHeight ? current : shortest,
      );
      shortestColumn.items.push(category);
      shortestColumn.estimatedHeight += estimatedHeight;
    });

    return columns.map((column) => column.items);
  }, [activeCategory, hasCategoryImages]);

  const totalGrandchildren =
    activeCategory?.children?.reduce(
      (total, child) => total + (child.children?.length || 0),
      0,
    ) ?? 0;

  return {
    activeCategory,
    activeCategoryImages,
    hasCategoryImages,
    useVerticalCategoryList,
    balancedTextColumns,
    shouldUseGrid:
      (activeCategory?.children?.length ?? 0) > 4 || totalGrandchildren > 8,
  };
}
