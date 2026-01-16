import { authService } from "./api.base.service";

export interface Courier {
  id: number;
  courier_company_id: number;
  courier_name: string;
  freight_charge: number;
  estimated_delivery_days: string;
  rating: number;
  cod: number;
  is_surface: boolean;
}

export interface TrackingActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
  sr_status: string;
  sr_status_label: string;
}

export interface TrackingInfo {
  tracking_data: {
    track_status: number;
    shipment_status: string;
    shipment_track: Array<{
      id: number;
      awb_code: string;
      courier_company_id: number;
      shipment_id: number;
      order_id: number;
      pickup_date: string;
      delivered_date: string | null;
      weight: string;
      packages: number;
      current_status: string;
      delivered_to: string | null;
      destination: string;
      consignee_name: string;
      origin: string;
      courier_agent_details: string | null;
      edd: string | null;
    }>;
    shipment_track_activities: TrackingActivity[];
  };
}

export interface Shipment {
  id: string;
  orderId: string;
  shiprocketOrderId?: string;
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceabilityResponse {
  success: boolean;
  data: {
    serviceable: boolean;
    couriers: Courier[];
  };
}

export interface ShippingCalculation {
  baseCharge: number;
  weight: number;
  distance: number;
  isServiceable: boolean;
  estimatedDeliveryDays: string;
  couriers: Courier[];
  cheapestCourier?: Courier;
  fastestCourier?: Courier;
}

class ShipmentApiService {
  /**
   * Check if delivery is available to a pincode
   */
  async checkServiceability(params: {
    pickupPincode: string;
    deliveryPincode: string;
  }): Promise<ServiceabilityResponse> {
    const response = await authService.api.post(
      "/shipments/check-serviceability",
      params
    );
    return response.data;
  }

  /**
   * Track shipment by tracking number (public - no auth required)
   */
  async trackByTrackingNumber(trackingNumber: string): Promise<{
    success: boolean;
    data: TrackingInfo;
  }> {
    const response = await authService.api.get(
      `/shipments/track/${trackingNumber}`
    );
    return response.data;
  }

  /**
   * Get shipment details for order (authenticated)
   */
  async getShipmentByOrderId(orderId: string): Promise<{
    success: boolean;
    data: Shipment;
  }> {
    const response = await authService.api.get(
      `/shipments/order/${orderId}`
    );
    return response.data;
  }

  /**
   * Track shipment by order ID (authenticated)
   */
  async trackShipmentByOrderId(orderId: string): Promise<{
    success: boolean;
    data: TrackingInfo;
  }> {
    const response = await authService.api.get(
      `/shipments/order/${orderId}/track`
    );
    return response.data;
  }

  /**
   * Calculate shipping cost based on pincode and cart details
   */
  async calculateShipping(params: {
    deliveryPincode: string;
    cartValue: number;
    weight?: number;
  }): Promise<ShippingCalculation> {
    // Default warehouse pincode (can be configured)
    const pickupPincode = process.env.NEXT_PUBLIC_WAREHOUSE_PINCODE || "110001";

    try {
      const serviceability = await this.checkServiceability({
        pickupPincode,
        deliveryPincode: params.deliveryPincode,
      });

      if (
        !serviceability.data.serviceable ||
        serviceability.data.couriers.length === 0
      ) {
        return {
          baseCharge: 0,
          weight: params.weight || 0.5,
          distance: 0,
          isServiceable: false,
          estimatedDeliveryDays: "N/A",
          couriers: [],
        };
      }

      const couriers = serviceability.data.couriers;

      // Find cheapest and fastest courier
      const cheapestCourier = couriers.reduce((prev, curr) =>
        prev.freight_charge < curr.freight_charge ? prev : curr
      );

      const fastestCourier = couriers.reduce((prev, curr) => {
        const prevDays = parseInt(prev.estimated_delivery_days.split("-")[0]);
        const currDays = parseInt(curr.estimated_delivery_days.split("-")[0]);
        return prevDays < currDays ? prev : curr;
      });

      // Apply free shipping logic
      const baseCharge =
        params.cartValue >= 1000 ? 0 : cheapestCourier.freight_charge;

      return {
        baseCharge,
        weight: params.weight || 0.5,
        distance: 0,
        isServiceable: true,
        estimatedDeliveryDays: cheapestCourier.estimated_delivery_days,
        couriers,
        cheapestCourier,
        fastestCourier,
      };
    } catch (error) {
      console.error("Error calculating shipping:", error);
      // Return default values if API fails
      return {
        baseCharge: params.cartValue >= 1000 ? 0 : 50,
        weight: params.weight || 0.5,
        distance: 0,
        isServiceable: true,
        estimatedDeliveryDays: "3-5 days",
        couriers: [],
      };
    }
  }

  /**
   * Calculate GST (18% for most items in India)
   */
  calculateGST(params: {
    subtotal: number;
    discount: number;
    shippingCost: number;
  }): {
    cgst: number;
    sgst: number;
    igst: number;
    totalGst: number;
    taxableAmount: number;
  } {
    const taxableAmount =
      params.subtotal - params.discount + params.shippingCost;
    const gstRate = 0.18; // 18% GST
    const totalGst = taxableAmount * gstRate;

    // For inter-state: IGST (18%)
    // For intra-state: CGST (9%) + SGST (9%)
    return {
      cgst: totalGst / 2, // 9%
      sgst: totalGst / 2, // 9%
      igst: totalGst, // 18% (if inter-state)
      totalGst,
      taxableAmount,
    };
  }

  /**
   * Get complete order calculation including GST
   */
  async getOrderCalculation(params: {
    deliveryPincode: string;
    subtotal: number;
    discount: number;
    couponCode?: string;
  }): Promise<{
    subtotal: number;
    discount: number;
    shippingCost: number;
    gst: {
      cgst: number;
      sgst: number;
      igst: number;
      totalGst: number;
      taxableAmount: number;
    };
    total: number;
    estimatedDelivery: string;
    isServiceable: boolean;
  }> {
    const shipping = await this.calculateShipping({
      deliveryPincode: params.deliveryPincode,
      cartValue: params.subtotal,
    });

    const gst = this.calculateGST({
      subtotal: params.subtotal,
      discount: params.discount,
      shippingCost: shipping.baseCharge,
    });

    const total =
      params.subtotal - params.discount + shipping.baseCharge + gst.totalGst;

    return {
      subtotal: params.subtotal,
      discount: params.discount,
      shippingCost: shipping.baseCharge,
      gst,
      total,
      estimatedDelivery: shipping.estimatedDeliveryDays,
      isServiceable: shipping.isServiceable,
    };
  }

  /**
   * Format tracking status for display
   */
  formatTrackingStatus(status: string): {
    label: string;
    color: string;
    icon: string;
  } {
    const statusMap: Record<
      string,
      { label: string; color: string; icon: string }
    > = {
      "Order Confirmed": {
        label: "Order Confirmed",
        color: "blue",
        icon: "✓",
      },
      Shipped: {
        label: "Shipped",
        color: "purple",
        icon: "📦",
      },
      "In Transit": {
        label: "In Transit",
        color: "yellow",
        icon: "🚚",
      },
      "Out for Delivery": {
        label: "Out for Delivery",
        color: "orange",
        icon: "🏃",
      },
      Delivered: {
        label: "Delivered",
        color: "green",
        icon: "✓",
      },
      Cancelled: {
        label: "Cancelled",
        color: "red",
        icon: "✗",
      },
      "RTO Initiated": {
        label: "Return Initiated",
        color: "red",
        icon: "↩",
      },
    };

    return (
      statusMap[status] || {
        label: status,
        color: "gray",
        icon: "•",
      }
    );
  }
}

export const shipmentApi = new ShipmentApiService();
