"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product.api";
import type { ProductQueryParams } from "@/lib/api/product.api";
import type { CategoryProductsClientProps } from "../types";

interface UseCategoryProductQueryProps {
  categorySlug: string;
  queryParams: ProductQueryParams;
  isDefaultQuery: boolean;
  initialProducts: CategoryProductsClientProps["initialProducts"];
}

export function useCategoryProductQuery({
  categorySlug,
  queryParams,
  isDefaultQuery,
  initialProducts,
}: UseCategoryProductQueryProps) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => ["products", categorySlug, JSON.stringify(queryParams)] as const,
    [categorySlug, queryParams],
  );

  useEffect(() => {
    if (isDefaultQuery && initialProducts) {
      queryClient.setQueryData(queryKey, initialProducts);
    }
  }, [initialProducts, isDefaultQuery, queryKey, queryClient]);

  const query = useQuery({
    queryKey,
    initialData: isDefaultQuery ? initialProducts : undefined,
    queryFn: () => productApi.getProducts(queryParams),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  return {
    ...query,
    products: query.data?.data?.products ?? [],
    total: query.data?.data?.pagination?.total ?? 0,
    totalPages: query.data?.data?.pagination?.totalPages ?? 1,
    currentPage: query.data?.data?.pagination?.page ?? 1,
  };
}
