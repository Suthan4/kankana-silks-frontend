"use client";

import { RouteErrorState } from "@/features/shared/components/RouteErrorState";

export default function AccountRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="We couldn’t load your account"
      message="Your account page could not be loaded. Please try again."
      reference={error.digest}
    />
  );
}
