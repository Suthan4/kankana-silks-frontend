import { useQuery } from "@tanstack/react-query";
import { ReturnApiService } from "@/lib/api/return.api";
import { orderKeys, orderQueryPolicy } from "@/hooks/useOrders";

/**
 * ✅ Hook to determine which actions are available for an order
 * - Track Order: Available when AWB exists and order is shipped/in-transit/delivered
 * - Return: Available within 24 hours of delivery
 * - Cancel: Available within 24 hours of order placement (before AWB)
 */
export function useOrderActions(order: any) {
  // ✅ Check return eligibility
  const { data: returnEligibility } = useQuery({
    queryKey: orderKeys.returnEligibility(order?.id ?? ""),
    queryFn: () =>
      order?.id
        ? ReturnApiService.checkReturnEligibility(order.id)
        : Promise.resolve(null),
    enabled: !!order && order.status === "DELIVERED",
    ...orderQueryPolicy,
  });

  // ✅ Determine if tracking is available
  const canTrack =
    order?.shipment?.awbCode &&
    ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status);

  // ✅ Determine if return button should show
  const canReturn =
    order?.status === "DELIVERED" &&
    returnEligibility?.eligible === true &&
    (returnEligibility?.hoursRemaining ?? 0) > 0;

  // ✅ Calculate return window status
  const returnWindowClosed =
    order?.status === "DELIVERED" &&
    returnEligibility?.eligible === false &&
    returnEligibility?.reason?.includes("expired");

  return {
    // Actions
    canTrack,
    canReturn,
    returnWindowClosed,

    // Return eligibility details
    returnEligibility: returnEligibility || null,
    hoursRemaining: returnEligibility?.hoursRemaining ?? 0,
    deliveredAt: returnEligibility?.deliveredAt,
  };
}