"use client";

import { useQuery } from "@tanstack/react-query";
import { shipmentApi } from "@/lib/api/shipment.api";

export function useTracking(trackingNumber?: string) {
  return useQuery({
    queryKey: ["tracking", trackingNumber],
    queryFn: () =>
      shipmentApi.trackByTrackingNumber(trackingNumber as string),

    enabled: !!trackingNumber, // only run when exists
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    gcTime: 5 * 60_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
}
