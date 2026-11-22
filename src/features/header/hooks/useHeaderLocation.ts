"use client";

import { useEffect, useState } from "react";
import { shipmentApi } from "@/lib/api/shipment.api";
import { toast } from "@/store/useToastStore";
import type { User } from "@/store/useAuthModalStore";
import type { HeaderAddress, HeaderLocation } from "../types";

interface UseHeaderLocationOptions {
  user: User | null;
  defaultAddress?: HeaderAddress;
  locationModalOpen: boolean;
  onClose: () => void;
}

export function useHeaderLocation({
  user,
  defaultAddress,
  locationModalOpen,
  onClose,
}: UseHeaderLocationOptions) {
  const [location, setLocation] = useState<HeaderLocation | null>(null);
  const [pincode, setPincode] = useState("");
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (user && defaultAddress) {
      const nextLocation = {
        city: defaultAddress.city?.trim() || "Your Area",
        pincode: defaultAddress.pincode,
        isServiceable: true,
      };
      setLocation(nextLocation);
      localStorage.setItem("userLocation", JSON.stringify(nextLocation));
    } else if (!user) {
      const savedLocation = localStorage.getItem("userLocation");
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        setLocation({ ...parsed, city: parsed.city?.trim() || "Your Area" });
      }
    }
  }, [user, defaultAddress]);

  useEffect(() => {
    if (locationModalOpen && location?.pincode) {
      setPincode(location.pincode);
    }
  }, [locationModalOpen, location?.pincode]);

  const checkPincodeServiceability = async (deliveryPincode: string) => {
    setIsCheckingPincode(true);
    try {
      const response = await shipmentApi.checkServiceability({
        pickupPincode: process.env.NEXT_PUBLIC_WAREHOUSE_PINCODE || "110001",
        deliveryPincode,
      });
      return response.data.serviceable;
    } catch (error) {
      console.error("Error checking pincode:", error);
      return true;
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const handlePincodeSubmit = async () => {
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    const isServiceable = await checkPincodeServiceability(pincode);
    const nextLocation = { city: "Your Area", pincode, isServiceable };
    setLocation(nextLocation);
    localStorage.setItem("userLocation", JSON.stringify(nextLocation));
    setPincode("");
    if (isServiceable) {
      toast.success("Delivery available to your location!");
    } else {
      toast.error("Sorry, delivery not available to this pincode yet");
    }
    onClose();
    return isServiceable;
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "User-Agent": "KankanaSilks/1.0" } },
          );
          const data = await response.json();
          const detectedPincode = data.address?.postcode;
          if (detectedPincode) {
            setPincode(detectedPincode);
            const isServiceable = await checkPincodeServiceability(detectedPincode);
            const nextLocation = {
              city: data.address?.city || data.address?.town || "Your Area",
              pincode: detectedPincode,
              isServiceable,
            };
            setLocation(nextLocation);
            localStorage.setItem("userLocation", JSON.stringify(nextLocation));
            onClose();
            if (isServiceable) {
              toast.success(`Location detected: ${detectedPincode}. Delivery available!`);
            } else {
              toast.error(`Location detected: ${detectedPincode}. Not serviceable yet.`);
            }
          } else {
            toast.error("Could not detect pincode from your location");
          }
        } catch (error) {
          toast.error("Failed to get location details");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location access denied.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information unavailable");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out");
            break;
          default:
            toast.error("Failed to get your location");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  return {
    location,
    setLocation,
    pincode,
    setPincode,
    isCheckingPincode,
    isGettingLocation,
    handlePincodeSubmit,
    handleUseCurrentLocation,
  };
}
