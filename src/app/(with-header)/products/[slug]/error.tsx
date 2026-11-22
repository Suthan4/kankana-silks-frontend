"use client";

import { RouteErrorState } from "@/features/shared/components/RouteErrorState";

export default function LegacyProductRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorState reset={reset} reference={error.digest} />;
}
