import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  orderApi,
  type CreateOrderDTO,
  type VerifyPaymentDTO,
  type CancelOrderDTO,
  type QueryOrderParams,
  type UpdateOrderStatusDTO,
  InitiatePaymentDTO,
} from "@/lib/api/order.api";
import { toast } from "@/store/useToastStore";

// ==================== QUERY KEYS ====================
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: QueryOrderParams) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  byNumber: (orderNumber: string) => [...orderKeys.all, "number", orderNumber] as const,
  canCancel: (id: string) => [...orderKeys.all, "can-cancel", id] as const,
  returnEligibility: (id: string) => [...orderKeys.all, "return-eligibility", id] as const,
};

// Customer order data changes after payment, cancellation and shipment updates.
export const orderQueryPolicy = {
  staleTime: 15_000,
  gcTime: 5 * 60_000,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchInterval: 30_000,
  refetchIntervalInBackground: false,
} as const;

// ==================== USER QUERIES ====================

// ✅ NEW: Initiate payment hook (Step 1: Create Razorpay session)
export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: (data: InitiatePaymentDTO) => orderApi.initiatePayment(data),
    onError: (error: any) => {
      toast.error(error.message || "Failed to initiate payment");
    },
  });
};

// ✅ UPDATED: Verify payment hook (Step 2: Verify payment AND create order)
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyPaymentDTO) => orderApi.verifyPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.message || "Payment verification failed");
    },
  });
};

/**
 * Get user's orders with pagination and filters
 */
export function useOrders(params?: QueryOrderParams) {
  return useQuery({
    queryKey: orderKeys.list(params || {}),
    queryFn: () => orderApi.getUserOrders(params),
    ...orderQueryPolicy,
  });
}

/**
 * Get single order by ID
 */
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => orderApi.getOrder(orderId),
    enabled: !!orderId,
    ...orderQueryPolicy,
  });
}

/**
 * Get order by order number
 */
export function useOrderByNumber(orderNumber: string) {
  return useQuery({
    queryKey: orderKeys.byNumber(orderNumber),
    queryFn: () => orderApi.getOrderByNumber(orderNumber),
    enabled: !!orderNumber,
    staleTime: 30000,
  });
}

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      orderApi.cancelOrder(orderId, { reason }),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.canCancel(variables.orderId) });
      toast.success("Order cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel order");
    },
  });
};

// Check if can cancel
export const useCanCancelOrder = (orderId?: string) => {
  return useQuery({
    queryKey: orderKeys.canCancel(orderId ?? ""),
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID required");
      const response = await orderApi.canCancelOrder(orderId);
      return response.data;
    },
    enabled: !!orderId,
    ...orderQueryPolicy,
  });
};

// ==================== USER MUTATIONS ====================

/**
 * Create new order from cart
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderDTO) => orderApi.createOrder(data),
    onSuccess: (response) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      
      // Show success message
      toast.success(response.message || "Order created successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to create order";
      toast.error(message);
    },
  });
}


// ==================== ADMIN QUERIES ====================

/**
 * Get all orders (Admin only)
 */
export function useAdminOrders(params?: QueryOrderParams) {
  return useQuery({
    queryKey: [...orderKeys.all, "admin", params || {}],
    queryFn: () => orderApi.getAllOrders(params),
  });
}

/**
 * Update order status (Admin only)
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: UpdateOrderStatusDTO }) =>
      orderApi.updateOrderStatus(orderId, data),
    onSuccess: (response, variables) => {
      // Invalidate admin orders list
      queryClient.invalidateQueries({ 
        queryKey: [...orderKeys.all, "admin"] 
      });
      
      // Invalidate specific order
      queryClient.invalidateQueries({ 
        queryKey: orderKeys.detail(variables.orderId) 
      });
      
      toast.success("Order status updated successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update order status";
      toast.error(message);
    },
  });
}

// ==================== HELPER HOOKS ====================

/**
 * Prefetch order details (useful for hover/link states)
 */
export function usePrefetchOrder() {
  const queryClient = useQueryClient();

  return (orderId: string) => {
    queryClient.prefetchQuery({
      queryKey: orderKeys.detail(orderId),
      queryFn: () => orderApi.getOrder(orderId),
      ...orderQueryPolicy,
    });
  };
}

/**
 * Get cached order (useful for optimistic updates)
 */
export function useCachedOrder(orderId: string) {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(orderKeys.detail(orderId));
}