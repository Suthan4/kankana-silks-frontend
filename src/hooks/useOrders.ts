// src/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/lib/api/order.api";
import type {
  CreateOrderDTO,
  VerifyPaymentDTO,
  CancelOrderDTO,
} from "@/lib/api/order.api";
import { toast } from "sonner";

// Query Keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  byNumber: (orderNumber: string) =>
    [...orderKeys.all, "number", orderNumber] as const,
  canCancel: (id: string) => [...orderKeys.all, "can-cancel", id] as const,
};

// Get user orders
export const useOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "total" | "orderNumber";
  sortOrder?: "asc" | "desc";
}) => {
  return useQuery({
    queryKey: orderKeys.list(params || {}),
    queryFn: () => orderApi.getUserOrders(params),
    staleTime: 30000, // 30 seconds
  });
};

// Get single order
export const useOrder = (orderId: string, enabled = true) => {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => orderApi.getOrder(orderId),
    enabled: enabled && !!orderId,
  });
};

// Get order by order number
export const useOrderByNumber = (orderNumber: string, enabled = true) => {
  return useQuery({
    queryKey: orderKeys.byNumber(orderNumber),
    queryFn: () => orderApi.getOrderByNumber(orderNumber),
    enabled: enabled && !!orderNumber,
  });
};

// Check if order can be cancelled
export const useCanCancelOrder = (orderId: string, enabled = true) => {
  return useQuery({
    queryKey: orderKeys.canCancel(orderId),
    queryFn: () => orderApi.canCancelOrder(orderId),
    enabled: enabled && !!orderId,
  });
};

// Create order mutation
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderDTO) => orderApi.createOrder(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success("Order created successfully!");
      return data;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create order");
    },
  });
};

// Verify payment mutation
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyPaymentDTO) => orderApi.verifyPayment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(data.data.id),
      });
      toast.success("Payment verified successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Payment verification failed"
      );
    },
  });
};

// Cancel order mutation
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data?: CancelOrderDTO;
    }) => orderApi.cancelOrder(orderId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      });
      toast.success("Order cancelled successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to cancel order");
    },
  });
};
