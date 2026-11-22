import { CategoryProductsSkeleton } from "@/features/category/components/CategoryProductsSkeleton";

/**
 * Segment-level loading UI while the category Server Component resolves its
 * category metadata and first product page.
 */
export default function CategoryLoading() {
  return <CategoryProductsSkeleton />;
}
