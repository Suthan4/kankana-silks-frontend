import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

export default function AccountLoading() {
  return (
    <SkeletonGroup label="Loading your account" className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <Skeleton className="hidden h-[32rem] rounded-2xl lg:block" />
          <div className="space-y-5">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <Skeleton className="mb-5 h-6 w-40" />
              <div className="grid gap-4 md:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-12 rounded-lg" />
                ))}
              </div>
              <Skeleton className="mt-6 h-11 w-36 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonGroup>
  );
}
