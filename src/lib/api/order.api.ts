import { authService } from "./api.base.service";

// ==================== TYPES ====================

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

export interface OrderShippingInfo {
  id: string;
  orderId: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  pickupAddress: string;
  pickupAddressLine2?: string;
  pickupCity: string;
  pickupState: string;
  pickupPincode: string;
  pickupCountry: string;
  pickupPhone?: string;
  pickupEmail?: string;
  pickupContactPerson?: string;
  totalWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  length: number;
  breadth: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "COMPLETED";
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingAddressSnapshot?: any;
  billingAddressSnapshot?: any;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  payment?: {
    id: string;
    method: "COD" | "CARD" | "UPI" | "WALLET" | "NET_BANKING" | "RAZORPAY";
    status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
    amount: number;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    refundAmount?: number;
    createdAt: string;
  };
  shipment?: {
    id: string;
    trackingNumber?: string;
    courierName?: string;
    shiprocketOrderId?: string;
    shiprocketShipmentId?: string;
    awbCode?: string;
    shippedAt?: string;
    deliveredAt?: string;
    estimatedDelivery?: string;
  };
  shippingInfo?: OrderShippingInfo;
  coupon?: {
    code: string;
    discount: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ==================== DTOs ====================

export interface OrderPreviewDTO {
  shippingAddressId: string;
  couponCode?: string;  // ✅ NEW
  items?: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
}
export interface ShippingDimensions {
  totalWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  length: number;
  breadth: number;
  height: number;
}

export interface OrderPreviewResponse {
  success: boolean;
  data: {
    breakdown: {
      subtotal: number;
      discount: number;
      couponDiscount: number;  // ✅ NEW
      shippingCost: number;
      gstAmount: number;
      taxableAmount: number;
      total: number;
    };
    estimatedDelivery: string;
    itemCount: number;
    isServiceable: boolean;
    appliedCoupon?: {  // ✅ NEW
      id: string;
      code: string;
      description?: string;
      discountType: "PERCENTAGE" | "FIXED";
      discountValue: number;
      minOrderValue: number;
      maxDiscountAmount: number | null;
      scope: "ALL" | "CATEGORY" | "PRODUCT";
      userEligibility: "ALL" | "SPECIFIC_USERS" | "FIRST_TIME" | "NEW_USERS";
      newUserDays: number | null;
      maxUsage: number | null;
      perUserLimit: number | null;
      usageCount: number;
      validFrom: string;
      validUntil: string;
      isActive: boolean;
      // Categories and products might be included for display
      categories?: Array<{
        id: string;
        name: string;
        slug: string;
      }>;
      products?: Array<{
        id: string;
        name: string;
        slug: string;
        sellingPrice: number;
      }>;
    };
    couponError?: string;  // ✅ NEW: If coupon validation fails
  };
}

export interface CreateOrderDTO {
  shippingAddressId: string;
  billingAddressId: string;
  couponCode?: string;  // ✅ NEW
  paymentMethod: "COD" | "CARD" | "UPI" | "WALLET" | "NET_BANKING";
  items?: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
    razorpayOrderId: string;
    razorpayKeyId: string;
    amountInPaise: number;
    breakdown: {
      subtotal: number;
      discount: number;
      couponDiscount: number;  // ✅ NEW
      shippingCost: number;
      gstAmount: number;
      taxableAmount: number;
      total: number;
    };
    appliedCoupon?: {  // ✅ NEW
      code: string;
      discount: number;
    };
    shippingInfo: {
      warehouse: {
        name: string;
        city: string;
        pincode: string;
      };
      dimensions: ShippingDimensions;
    };
  };
}

export interface VerifyPaymentDTO {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface UpdateOrderStatusDTO {
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "COMPLETED";
}

export interface CancelOrderDTO {
  reason?: string;
}

export interface QueryOrderParams {
  page?: number;
  limit?: number;
  status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "COMPLETED";
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "total" | "orderNumber";
  sortOrder?: "asc" | "desc";
}

// ==================== RESPONSES ====================



export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data: Order;
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

export interface CancelOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
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

// ==================== API SERVICE ====================

class OrderApiService {

   /**
   * ✅ NEW: Get order preview with accurate totals
   * POST /api/orders/preview
   */
  async getOrderPreview(data: OrderPreviewDTO): Promise<OrderPreviewResponse> {
    const response = await authService.api.post("/orders/preview", data);
    return response.data;
  }

  /**
   * Create a new order from cart
   * POST /api/orders
   */
  async createOrder(data: CreateOrderDTO) {
    const response = await authService.api.post("/orders", data);
    return response.data;
  }

  /**
   * Verify Razorpay payment
   * POST /api/orders/verify-payment
   */
  async verifyPayment(data: VerifyPaymentDTO): Promise<VerifyPaymentResponse> {
    const response = await authService.api.post("/orders/verify-payment", data);
    return response.data;
  }

  /**
   * Get user's orders with pagination and filters
   * GET /api/orders/my-orders
   */
  async getUserOrders(params?: QueryOrderParams): Promise<OrdersResponse> {
    const response = await authService.api.get("/orders/my-orders", {
      params,
    });
    return response.data;
  }

  /**
   * Get order by ID
   * GET /api/orders/:id
   */
  async getOrder(orderId: string): Promise<OrderResponse> {
    const response = await authService.api.get(`/orders/${orderId}`);
    return response.data;
  }

  /**
   * Get order by order number
   * GET /api/orders/number/:orderNumber
   */
  async getOrderByNumber(orderNumber: string): Promise<OrderResponse> {
    const response = await authService.api.get(`/orders/number/${orderNumber}`);
    return response.data;
  }

  /**
   * Check if order can be cancelled
   * GET /api/orders/:id/can-cancel
   */
  async canCancelOrder(orderId: string): Promise<CanCancelResponse> {
    const response = await authService.api.get(`/orders/${orderId}/can-cancel`);
    return response.data;
  }

  /**
   * Cancel order
   * POST /api/orders/:id/cancel
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

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Get all orders (Admin)
   * GET /api/admin/orders
   */
  async getAllOrders(params?: QueryOrderParams): Promise<OrdersResponse> {
    const response = await authService.api.get("/admin/orders", {
      params,
    });
    return response.data;
  }

  /**
   * Update order status (Admin)
   * PUT /api/admin/orders/:id/status
   */
  async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusDTO
  ): Promise<OrderResponse> {
    const response = await authService.api.put(
      `/admin/orders/${orderId}/status`,
      data
    );
    return response.data;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Calculate order totals (client-side helper)
   */
  calculateTotals(params: {
    items: Array<{ price: number; quantity: number }>;
    shippingCost: number;
    discount?: number;
  }) {
    const subtotal = params.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const discount = params.discount || 0;
    const shipping = params.shippingCost;

    // Calculate GST (18% included in prices)
    const taxableAmount = subtotal - discount + shipping;
    const gst = taxableAmount * 0.18;

    const total = taxableAmount;

    return {
      subtotal,
      discount,
      shipping,
      gst,
      total,
      taxableAmount,
    };
  }

  /**
   * Format order status for display
   */
  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  /**
   * Get status color class
   */
  getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "SHIPPED":
        return "bg-blue-100 text-blue-700";
      case "PROCESSING":
        return "bg-orange-100 text-orange-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  /**
   * Get status gradient for hero cards
   */
  getStatusGradient(status: string): string {
    switch (status.toUpperCase()) {
      case "DELIVERED":
      case "COMPLETED":
        return "from-green-500 to-emerald-600";
      case "SHIPPED":
        return "from-blue-500 to-indigo-600";
      case "PROCESSING":
        return "from-orange-500 to-amber-600";
      case "PENDING":
        return "from-yellow-500 to-orange-500";
      case "CANCELLED":
        return "from-red-500 to-rose-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  }
}

export const orderApi = new OrderApiService();