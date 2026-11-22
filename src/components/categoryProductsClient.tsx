"use client";

import { Suspense } from "react";
import type { CategoryProductsClientProps } from "@/features/category/types";
import { CategoryProductsView } from "@/features/category/components/CategoryProductsView";
import { CategoryProductsSkeleton } from "@/features/category/components/CategoryProductsSkeleton";

/**
 * Keep useSearchParams below a local Suspense boundary for static builds.
 * The server route continues to supply category metadata, JSON-LD and data.
 */
export default function CategoryProductsClient(props: CategoryProductsClientProps) {
  return (
    <Suspense fallback={<CategoryProductsSkeleton categoryName={props.category.name} />}>
      <CategoryProductsView {...props} />
    </Suspense>
  );
}
