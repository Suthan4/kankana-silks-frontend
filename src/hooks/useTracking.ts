"use client";

import { useQuery } from "@tanstack/react-query";
import { shipmentApi } from "@/lib/api/shipment.api";

export function useTracking(trackingNumber?: string) {
  return useQuery({
    queryKey: ["tracking", trackingNumber],
    queryFn: () =>
      shipmentApi.trackByTrackingNumber(trackingNumber as string),

    enabled: !!trackingNumber, // only run when exists
    staleTime: 1000 * 60 * 2,  // 2 min cache
    retry: 1,
  });
}
