import { authService } from "./api.base.service";

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
  variant?: {
    size?: string;
    color?: string;
    fabric?: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  payment?: {
    id: string;
    method: string;
    status: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  };
  shipment?: {
    id: string;
    trackingNumber?: string;
    courierName?: string;
    shiprocketOrderId?: string;
    shippedAt?: string;
    deliveredAt?: string;
    estimatedDelivery?: string;
  };
  coupon?: {
    code: string;
    discount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface CreateOrderDTO {
  shippingAddressId: string;
  billingAddressId: string;
  couponCode?: string;
  paymentMethod: "COD" | "CARD" | "UPI" | "WALLET" | "NET_BANKING";
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
    razorpayOrderId: string;
    razorpayKeyId: string;
  };
}

export interface VerifyPaymentDTO {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

export interface CancelOrderDTO {
  reason?: string;
}

export interface CancelOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
    shiprocketCancelled: boolean;
    refundProcessed: boolean;
  };
}

export interface CanCancelResponse {
  success: boolean;
  data: {
    canCancel: boolean;
    reason?: string;
  };
}

class OrderApiService {
  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderDTO): Promise<CreateOrderResponse> {
    const response = await authService.api.post("/orders", data);
    return response.data;
  }

  /**
   * Verify Razorpay payment
   */
  async verifyPayment(data: VerifyPaymentDTO): Promise<OrderResponse> {
    const response = await authService.api.post(
      "/orders/verify-payment",
      data
    );
    return response.data;
  }

  /**
   * Get user's orders with pagination and filters
   */
  async getUserOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: "createdAt" | "total" | "orderNumber";
    sortOrder?: "asc" | "desc";
  }): Promise<OrdersResponse> {
    const response = await authService.api.get("/orders/my-orders", {
      params,
    });
    return response.data;
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<OrderResponse> {
    const response = await authService.api.get(`/orders/${orderId}`);
    return response.data;
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<OrderResponse> {
    const response = await authService.api.get(
      `/orders/number/${orderNumber}`
    );
    return response.data;
  }

  /**
   * Check if order can be cancelled
   */
  async canCancelOrder(orderId: string): Promise<CanCancelResponse> {
    const response = await authService.api.get(
      `/orders/${orderId}/can-cancel`
    );
    return response.data;
  }

  /**
   * Cancel order
   */
  async cancelOrder(
    orderId: string,
    data?: CancelOrderDTO
  ): Promise<CancelOrderResponse> {
    const response = await authService.api.post(
      `/orders/${orderId}/cancel`,
      data
    );
    return response.data;
  }

  /**
   * Calculate order totals (client-side helper)
   */
  calculateTotals(params: {
    items: Array<{ price: number; quantity: number }>;
    shippingCost: number;
    discount?: number;
    couponCode?: string;
  }) {
    const subtotal = params.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const discount = params.discount || 0;
    const shipping = params.shippingCost;
    const total = subtotal + shipping - discount;

    // Calculate GST (18% on subtotal - discount)
    const taxableAmount = subtotal - discount;
    const gst = taxableAmount * 0.18;

    return {
      subtotal,
      discount,
      shipping,
      gst,
      total: total + gst,
      taxableAmount,
    };
  }
}

export const orderApi = new OrderApiService();
