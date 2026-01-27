import { authService } from "./api.base.service";
import clientApiService from "./api.client.service";

export interface ShippingRateRequest {
  deliveryPincode: string;
  cod?: boolean;
  weight?: number;
}

export interface CourierRate {
  id: number;
  courier_company_id: number;
  courier_name: string;
  freight_charge: number;
  cod_charges?: number;
  total_charge: number;
  estimated_delivery_days: string;
  rating: number;
  is_surface: boolean;
  is_hyperlocal: boolean;
}

export interface ShippingRateResponse {
  success: boolean;
  data: {
    available_courier_companies: CourierRate[];
    shiprocket_recommended_courier_id?: number;
    cheapest_courier?: CourierRate;
    fastest_courier?: CourierRate;
  };
}

export interface ServiceabilityRequest {
  pickupPincode: string;
  deliveryPincode: string;
  cod?: boolean;
  weight?: number;
}

export interface ServiceabilityResponse {
  success: boolean;
  data: {
    serviceable: boolean;
    couriers: CourierRate[];
    message?: string;
  };
}

export interface CartShippingRequest {
  deliveryPincode: string;
  cartItems?: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
}

export interface CartShippingResponse {
  success: boolean;
  data: {
    subtotal: number;
    totalWeight: number;
    volumetricWeight: number;
    chargeableWeight: number;
    shippingCost: number;
    isFreeShipping: boolean;
    freeShippingThreshold: number;
    amountNeededForFreeShipping?: number;
    serviceable: boolean;
    estimatedDelivery: string;
    availableCouriers: CourierRate[];
    cheapestCourier?: CourierRate;
    fastestCourier?: CourierRate;
    message?: string;
  };
}

class ShippingAPI {
  /**
   * Get shipping rates for cart
   * Calculates real-time shipping based on cart items
   */
  async getCartShippingRates(
    request: CartShippingRequest
  ): Promise<CartShippingResponse> {
    const response = await authService.api.post<CartShippingResponse>(
      "/shipping/cart-rates",
      request
    );
    return response.data;
  }

  /**
   * Check pincode serviceability (public endpoint)
   */
  async checkServiceability(
    request: ServiceabilityRequest
  ): Promise<ServiceabilityResponse> {
    const response = await clientApiService.api.post<ServiceabilityResponse>(
      "/shipments/check-serviceability",
      request
    );
    return response.data;
  }

  /**
   * Get shipping rates by pincode
   */
  async getShippingRates(
    request: ShippingRateRequest
  ): Promise<ShippingRateResponse> {
    const response = await clientApiService.api.post<ShippingRateResponse>(
      "/shipping/rates",
      request
    );
    return response.data;
  }
}

export const shippingApi = new ShippingAPI();