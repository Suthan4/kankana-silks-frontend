"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/api/category.api";
import type { ProductQueryParams } from "@/lib/api/product.api";
import { CATEGORY_MATERIALS, CATEGORY_PAGE_SIZE } from "../constants";
import type { CategorySortValue } from "../types";

export function useCategoryFilters(category: Category) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const min = Number(searchParams.get("minPrice"));
    const max = Number(searchParams.get("maxPrice"));
    return [min > 0 ? min : 0, max > 0 && max < 100000 ? max : 100000];
  });
  const [sortBy, setSortBy] = useState<CategorySortValue>(() => {
    const field = searchParams.get("sortBy") || "price";
    const order = searchParams.get("sortOrder") || "desc";
    return `${field}-${order}` as CategorySortValue;
  });
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    searchParams.get("subcategory") || null,
  );
  const [selectedFabric, setSelectedFabric] = useState<string[]>(
    searchParams.get("fabric") ? searchParams.get("fabric")!.split(",") : [],
  );

  const updateFilters = useCallback(
    (updates: Record<string, string | number | boolean | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === "" ||
          value === false ||
          (key === "minPrice" && value === 0) ||
          (key === "maxPrice" && value === 100000)
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  const queryParams: ProductQueryParams = useMemo(() => {
    const params: ProductQueryParams = {
      page: Number(searchParams.get("page")) || 1,
      limit: CATEGORY_PAGE_SIZE,
      isActive: true,
      categorySlug: category.slug,
    };

    if (selectedSubCategory) {
      const child = category.children?.find((item) => item.id === selectedSubCategory);
      if (child) params.categorySlug = child.slug;
    }

    const search = searchParams.get("search");
    if (search) params.search = search;

    const minPrice = Number(searchParams.get("minPrice"));
    const maxPrice = Number(searchParams.get("maxPrice"));
    if (minPrice > 0) params.minPrice = minPrice;
    if (maxPrice > 0 && maxPrice < 100000) params.maxPrice = maxPrice;

    params.sortBy = (searchParams.get("sortBy") || "price") as ProductQueryParams["sortBy"];
    params.sortOrder = (searchParams.get("sortOrder") || "desc") as ProductQueryParams["sortOrder"];

    const color = searchParams.get("color");
    if (color) params.color = color;

    const fabric = searchParams.get("fabric");
    if (fabric) {
      params.fabric = fabric.split(",").map((value) => value.trim()).filter(Boolean);
    }

    const size = searchParams.get("size");
    if (size) params.size = size;
    if (searchParams.get("inStock") === "true") params.inStock = true;

    return params;
  }, [searchParams, category, selectedSubCategory]);

  const isDefaultQuery =
    Object.keys(queryParams).length === 6 &&
    queryParams.page === 1 &&
    queryParams.limit === CATEGORY_PAGE_SIZE &&
    queryParams.categorySlug === category.slug &&
    queryParams.sortBy === "price" &&
    queryParams.sortOrder === "desc";

  const handlePageChange = (page: number) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubCategoryChange = (id: string | null) => {
    setSelectedSubCategory(id);
    updateFilters({ subcategory: id, page: 1 });
  };

  const handlePriceRangeChange = (nextRange: [number, number]) => {
    setPriceRange(nextRange);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateFilters({ minPrice: nextRange[0], maxPrice: nextRange[1], page: 1 });
    }, 400);
  };

  const handleSortChange = (nextSort: CategorySortValue) => {
    setSortBy(nextSort);
    const [sortField, sortOrder] = nextSort.split("-");
    updateFilters({ sortBy: sortField, sortOrder, page: 1 });
  };

  const handleFabricChange = (material: string) => {
    const updated = selectedFabric.includes(material)
      ? selectedFabric.filter((value) => value !== material)
      : [...selectedFabric, material];
    setSelectedFabric(updated);
    updateFilters({ fabric: updated.length ? updated.join(",") : null, page: 1 });
  };

  const clearAllFilters = () => {
    setPriceRange([0, 100000]);
    setSelectedFabric([]);
    setSelectedSubCategory(null);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    router.push(`/shop/${category.slug}`);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return {
    queryParams,
    isDefaultQuery,
    priceRange,
    setPriceRange,
    sortBy,
    selectedSubCategory,
    selectedFabric,
    materials: CATEGORY_MATERIALS,
    handlePageChange,
    handleSubCategoryChange,
    handlePriceRangeChange,
    handleSortChange,
    handleFabricChange,
    clearAllFilters,
  };
}
