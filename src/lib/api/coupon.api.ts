import clientApiService from "./api.client.service";

// Types
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  scope: "ALL" | "CATEGORY" | "PRODUCT";
  userEligibility: "ALL" | "SPECIFIC_USERS" | "FIRST_TIME" | "NEW_USERS";
  maxUsage?: number;
  perUserLimit?: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
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
    media: Array<{ url: string }>;
  }>;
  estimatedDiscount?: number;
  estimatedFinalAmount?: number;
}

export interface ValidateCouponRequest {
  code: string;
  orderAmount: number;
  cartItems: Array<{
    productId: string;
    categoryId?: string;
    quantity: number;
    price: number;
  }>;
}

export interface CouponDetails {
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

  validFrom: string; // ISO date string
  validUntil: string; // ISO date string
  isActive: boolean;

  categoryIds: string[];
  productIds: string[];
  eligibleUserIds: string[];
}

export interface ValidateCouponResponse {
  valid: boolean;
  error?: string;
  coupon?: CouponDetails;
  discount?: number;
  finalAmount?: number;
}



export interface ApplicableCouponsRequest {
  orderAmount: number;
  cartItems: Array<{
    productId: string;
    categoryId?: string;
    quantity: number;
    price: number;
  }>;
}

export const couponApi = {
  // Get active coupons (public)
  getActiveCoupons: async () => {
    const response = await clientApiService.api.get<{ success: boolean; data: Coupon[] }>(
      "/coupons/active"
    );
    return response.data;
  },

  // Validate coupon
  validateCoupon: async (data: ValidateCouponRequest) => {
    const response = await clientApiService.api.post(
      "/coupons/validate",
      data
    );
    return response.data;
  },

  // Get applicable coupons for cart
  getApplicableCoupons: async (data: ApplicableCouponsRequest) => {
    const response = await clientApiService.api.post<{
      success: boolean;
      message: string;
      data: Coupon[];
    }>("/coupons/applicable", data);
    return response.data;
  },

  // Apply coupon (for order creation - used in backend)
  applyCoupon: async (data: {
    code: string;
    orderAmount: number;
    cartItems: Array<{
      productId: string;
      categoryId?: string;
      quantity: number;
      price: number;
    }>;
  }) => {
    const response = await clientApiService.api.post<{
      success: boolean;
      message: string;
      data: {
        coupon: Coupon;
        discount: number;
        finalAmount: number;
      };
    }>("/coupons/apply", data);
    return response.data;
  },
};