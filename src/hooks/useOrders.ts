import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  orderApi,
  type CreateOrderDTO,
  type VerifyPaymentDTO,
  type CancelOrderDTO,
  type QueryOrderParams,
  type UpdateOrderStatusDTO,
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
};

// ==================== USER QUERIES ====================

/**
 * Get user's orders with pagination and filters
 */
export function useOrders(params?: QueryOrderParams) {
  return useQuery({
    queryKey: orderKeys.list(params || {}),
    queryFn: () => orderApi.getUserOrders(params),
    staleTime: 30000, // 30 seconds
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
    staleTime: 30000,
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

/**
 * Check if order can be cancelled
 */
export function useCanCancelOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.canCancel(orderId),
    queryFn: () => orderApi.canCancelOrder(orderId),
    enabled: !!orderId,
    staleTime: 10000, // 10 seconds
  });
}

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

/**
 * Verify Razorpay payment
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyPaymentDTO) => orderApi.verifyPayment(data),
    onSuccess: (response) => {
      // Invalidate orders
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      
      // Update specific order if we have the ID
      if (response.data?.id) {
        queryClient.setQueryData(
          orderKeys.detail(response.data.id),
          response
        );
      }
      
      toast.success("Payment verified successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Payment verification failed";
      toast.error(message);
    },
  });
}

/**
 * Cancel order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data?: CancelOrderDTO }) =>
      orderApi.cancelOrder(orderId, data),
    onSuccess: (response, variables) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      
      // Invalidate specific order
      queryClient.invalidateQueries({ 
        queryKey: orderKeys.detail(variables.orderId) 
      });
      
      // Invalidate can-cancel check
      queryClient.invalidateQueries({ 
        queryKey: orderKeys.canCancel(variables.orderId) 
      });
      
      toast.success(response.message || "Order cancelled successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to cancel order";
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
    staleTime: 30000,
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
      staleTime: 30000,
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