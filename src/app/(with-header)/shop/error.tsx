"use client";

import { RouteErrorState } from "@/features/shared/components/RouteErrorState";

export default function ShopRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="We couldn’t load the shop"
      message="The shop categories could not be loaded. Please try again."
      reference={error.digest}
    />
  );
}
