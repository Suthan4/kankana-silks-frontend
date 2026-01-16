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

export interface Payment {
  id: string;
  method: string;
  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  trackingNumber?: string;
  courierName?: string;
  shiprocketOrderId?: string;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingInfo {
  id: string;
  orderId: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  pickupAddress: string;
  pickupCity: string;
  pickupState: string;
  pickupPincode: string;
  pickupCountry: string;
  pickupPhone?: string;
  totalWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  length: number;
  breadth: number;
  height: number;
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
  payment?: Payment;
  shipment?: Shipment;
  shippingInfo?: ShippingInfo;
  coupon?: {
    code: string;
    discount: number;
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDTO {
  shippingAddressId: string;
  billingAddressId: string;
  couponCode?: string;
  paymentMethod: "COD" | "RAZORPAY" | "CARD" | "UPI" | "WALLET" | "NET_BANKING";
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
    razorpayOrderId: string;
    razorpayKeyId: string;
    shippingInfo?: {
      warehouse: {
        name: string;
        city: string;
        pincode: string;
      };
      dimensions: {
        totalWeight: number;
        volumetricWeight: number;
        chargeableWeight: number;
        length: number;
        breadth: number;
        height: number;
      };
    };
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
    shiprocketCancelled?: boolean;
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
   * Create a new order from cart
   */
  async createOrder(data: CreateOrderDTO): Promise<CreateOrderResponse> {
    const response = await authService.api.post("/orders", data);
    return response.data;
  }

  /**
   * Verify Razorpay payment signature
   */
  async verifyPayment(data: VerifyPaymentDTO): Promise<OrderResponse> {
    const response = await authService.api.post("/orders/verify-payment", data);
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
   * Get single order by ID
   */
  async getOrder(orderId: string): Promise<OrderResponse> {
    const response = await authService.api.get(`/orders/${orderId}`);
    return response.data;
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<OrderResponse> {
    const response = await authService.api.get(`/orders/number/${orderNumber}`);
    return response.data;
  }

  /**
   * Check if order can be cancelled
   */
  async canCancelOrder(orderId: string): Promise<CanCancelResponse> {
    const response = await authService.api.get(`/orders/${orderId}/can-cancel`);
    return response.data;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(
    orderId: string,
    data?: CancelOrderDTO
  ): Promise<CancelOrderResponse> {
    const response = await authService.api.post(
      `/orders/${orderId}/cancel`,
      data || {}
    );
    return response.data;
  }

  /**
   * Get shipping info for order
   */
  async getOrderShippingInfo(orderId: string): Promise<{
    success: boolean;
    data: ShippingInfo;
  }> {
    const response = await authService.api.get(
      `/orders/${orderId}/shipping-info`
    );
    return response.data;
  }

  /**
   * Admin: Get all orders with pagination and filters
   */
  async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: "createdAt" | "total" | "orderNumber";
    sortOrder?: "asc" | "desc";
  }): Promise<OrdersResponse> {
    const response = await authService.api.get("/admin/orders", {
      params,
    });
    return response.data;
  }

  /**
   * Admin: Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<OrderResponse> {
    const response = await authService.api.put(
      `/admin/orders/${orderId}/status`,
      { status }
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
    gstRate?: number;
  }) {
    const subtotal = params.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const discount = params.discount || 0;
    const shipping = params.shippingCost;
    
    // Calculate GST (default 18%)
    const taxableAmount = subtotal - discount + shipping;
    const gstRate = params.gstRate || 0.18;
    const gst = taxableAmount * gstRate;
    
    const total = taxableAmount + gst;

    return {
      subtotal,
      discount,
      shipping,
      gst,
      total,
      taxableAmount,
      cgst: gst / 2, // 9% for intra-state
      sgst: gst / 2, // 9% for intra-state
      igst: gst, // 18% for inter-state
    };
  }

  /**
   * Format order status for display
   */
  formatOrderStatus(status: string): {
    label: string;
    color: string;
    bgColor: string;
  } {
    const statusMap: Record<
      string,
      { label: string; color: string; bgColor: string }
    > = {
      pending: {
        label: "Pending",
        color: "text-yellow-700",
        bgColor: "bg-yellow-100",
      },
      processing: {
        label: "Processing",
        color: "text-orange-700",
        bgColor: "bg-orange-100",
      },
      shipped: {
        label: "Shipped",
        color: "text-blue-700",
        bgColor: "bg-blue-100",
      },
      delivered: {
        label: "Delivered",
        color: "text-green-700",
        bgColor: "bg-green-100",
      },
      cancelled: {
        label: "Cancelled",
        color: "text-red-700",
        bgColor: "bg-red-100",
      },
      completed: {
        label: "Completed",
        color: "text-green-700",
        bgColor: "bg-green-100",
      },
    };

    return (
      statusMap[status.toLowerCase()] || {
        label: status,
        color: "text-gray-700",
        bgColor: "bg-gray-100",
      }
    );
  }

  /**
   * Check if order can be reviewed
   */
  canReviewOrder(order: Order): boolean {
    return (
      order.status === "delivered" || 
      order.status === "completed"
    );
  }

  /**
   * Get order items that can be reviewed
   */
  getReviewableItems(order: Order): OrderItem[] {
    if (!this.canReviewOrder(order)) {
      return [];
    }
    return order.items;
  }
}

export const orderApi = new OrderApiService();