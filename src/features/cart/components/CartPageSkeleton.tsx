"use client";

import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

export function CartPageSkeleton() {
  return (
    <SkeletonGroup
      label="Loading your cart"
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50"
    >
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-xl border border-white/80 bg-white p-4 shadow-sm">
                <div className="flex gap-3">
                  <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-3 py-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-24" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-8 w-24 rounded-full" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <Skeleton className="mb-5 h-5 w-36" />
            <Skeleton className="mb-4 h-10 w-full rounded-lg" />
            <Skeleton className="mb-3 h-12 w-full rounded-lg" />
            <div className="space-y-4 border-t pt-4">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-5 h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </SkeletonGroup>
  );
}
