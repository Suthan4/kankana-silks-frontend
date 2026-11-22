"use client";

import { useCallback, useEffect, useState } from "react";
import { shipmentApi } from "@/lib/api/shipment.api";
import { toast } from "sonner";
import type { ProductDeliveryInfo } from "@/features/product/components/ProductDetailSections";

export function useProductDelivery(productId: string) {
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState<ProductDeliveryInfo | null>(null);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);

  const checkDeliveryAvailability = useCallback(async (pincodeToCheck: string) => {
    if (pincodeToCheck.length !== 6 || !/^\d+$/.test(pincodeToCheck)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    setIsCheckingDelivery(true);
    try {
      const response = await shipmentApi.checkServiceability({
        pickupPincode: process.env.NEXT_PUBLIC_WAREHOUSE_PINCODE || "110001",
        deliveryPincode: pincodeToCheck,
      });
      const couriers = response.data.couriers;
      const isServiceable = response.data.serviceable && couriers.length > 0;
      let estimatedDays = "3-5 days";
      if (isServiceable && couriers.length > 0) {
        const fastest = couriers.reduce((previous: any, current: any) => {
          const previousDays = parseInt(previous.estimated_delivery_days.split("-")[0]);
          const currentDays = parseInt(current.estimated_delivery_days.split("-")[0]);
          return previousDays < currentDays ? previous : current;
        });
        estimatedDays = fastest.estimated_delivery_days + " days";
      }
      setDeliveryInfo({ isServiceable, estimatedDays, checked: true });
      localStorage.setItem("userLocation", JSON.stringify({ pincode: pincodeToCheck, isServiceable }));
      if (isServiceable) toast.success(`Delivery available! Expected in ${estimatedDays}`);
      else toast.error("Sorry, delivery not available to this pincode");
    } catch (error) {
      console.error("Error checking delivery:", error);
      toast.error("Failed to check delivery availability");
      setDeliveryInfo({ isServiceable: false, estimatedDays: "N/A", checked: true });
    } finally {
      setIsCheckingDelivery(false);
    }
  }, []);

  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (!savedLocation) return;
    try {
      const location = JSON.parse(savedLocation);
      if (location?.pincode) {
        setPincode(location.pincode);
        void checkDeliveryAvailability(location.pincode);
      }
    } catch {
      localStorage.removeItem("userLocation");
    }
  }, [productId, checkDeliveryAvailability]);

  return {
    pincode,
    setPincode,
    deliveryInfo,
    isCheckingDelivery,
    checkDeliveryAvailability,
    checkDelivery: () => checkDeliveryAvailability(pincode),
  };
}
