import { Skeleton } from "@/components/ui/Skeleton";

interface CategoryProductsSkeletonProps {
  categoryName?: string;
}

/**
 * Responsive category-page fallback. Dimensions follow the category toolbar
 * and product cards so the real page can replace it without a large layout jump.
 */
export function CategoryProductsSkeleton({
  categoryName,
}: CategoryProductsSkeletonProps) {
  return (
    <div
      role="status"
      aria-label={categoryName ? `Loading ${categoryName} products` : "Loading category products"}
      aria-busy="true"
      className="min-h-screen bg-white"
    >
      {/* Mobile category heading and sort controls */}
      <div className="sticky top-0 z-40 border-b border-gray-100 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-hidden">
          <Skeleton className="h-7 w-20 shrink-0 rounded-full" />
          <Skeleton className="h-7 w-24 shrink-0 rounded-full" />
          <Skeleton className="h-7 w-20 shrink-0 rounded-full" />
          <Skeleton className="h-7 w-24 shrink-0 rounded-full" />
        </div>
      </div>

      {/* Desktop category title, subcategory chips and sort */}
      <div className="hidden items-center justify-between border-b border-gray-100 px-8 py-3 md:flex xl:px-10">
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-10 rounded" />
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-44 rounded-lg" />
        </div>
      </div>

      <div className="mx-auto max-w-[1450px] px-4 pb-16 pt-10 md:px-8 md:pt-20 xl:px-10">
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-6 md:gap-y-12">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="min-w-0 bg-white">
              <Skeleton className="aspect-[3/4] w-full" />
              <div className="space-y-2 pt-3">
                <Skeleton className="h-4 w-4/5 rounded" />
                <Skeleton className="h-4 w-2/5 rounded" />
                <Skeleton className="mt-3 h-9 w-full rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading products</span>
    </div>
  );
}
