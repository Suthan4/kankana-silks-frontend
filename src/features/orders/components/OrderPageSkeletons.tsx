"use client";

import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

export function OrdersPageSkeleton() {
  return (
    <SkeletonGroup label="Loading your orders" className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b bg-white p-4 shadow-sm lg:p-6">
        <div className="mx-auto max-w-4xl space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="flex gap-2 overflow-hidden">
            {[72, 94, 106, 86, 96, 94].map((width, index) => (
              <Skeleton key={index} className="h-10 shrink-0 rounded-xl" style={{ width }} />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl space-y-4 p-4 lg:p-6">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-2xl border-2 border-gray-100 bg-white p-5">
            <div className="mb-4 flex justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
            <div className="mb-4 flex gap-4 rounded-xl bg-gray-50 p-4">
              <Skeleton className="h-20 w-20 shrink-0 rounded-lg lg:h-24 lg:w-24" />
              <div className="flex-1 space-y-3 py-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex flex-col justify-between gap-4 border-t pt-4 sm:flex-row sm:items-center">
              <Skeleton className="h-7 w-28" />
              <div className="flex gap-2">
                <Skeleton className="h-11 w-24 rounded-xl" />
                <Skeleton className="h-11 w-28 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SkeletonGroup>
  );
}

export function OrderDetailsPageSkeleton() {
  return (
    <SkeletonGroup label="Loading order details" className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b bg-white p-4 lg:p-6">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl space-y-4 p-4 lg:p-6">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="rounded-2xl bg-white p-6">
          <Skeleton className="mb-5 h-5 w-32" />
          {[0, 1, 2].map((item) => (
            <div key={item} className="mb-4 flex gap-4">
              <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </SkeletonGroup>
  );
}

export function OrderTrackingPageSkeleton() {
  return (
    <SkeletonGroup label="Loading shipment tracking" className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b bg-white p-4 lg:p-6">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl space-y-4 p-4 lg:p-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="rounded-2xl bg-white p-6">
          <Skeleton className="mb-6 h-5 w-36" />
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="mb-6 flex gap-4">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </SkeletonGroup>
  );
}
