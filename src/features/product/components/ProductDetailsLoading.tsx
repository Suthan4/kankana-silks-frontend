import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

export default function ProductDetailsLoading() {
  return (
    <SkeletonGroup label="Loading product details" className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-2 py-4">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-32" />
        </div>

        <div className="grid gap-6 pb-10 pt-5 md:grid-cols-2">
          <div className="flex gap-3">
            <div className="hidden w-16 shrink-0 flex-col gap-2 md:flex">
              {[0, 1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-20 w-16 rounded-lg" />
              ))}
            </div>
            <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          </div>

          <div className="space-y-5 py-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="flex gap-3">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 flex-1 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-12">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    </SkeletonGroup>
  );
}
