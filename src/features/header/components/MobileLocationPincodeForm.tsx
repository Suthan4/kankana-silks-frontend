"use client";

import { motion } from "framer-motion";
import { Check, MapPin, X } from "lucide-react";
import type { User } from "@/store/useAuthModalStore";
import type { HeaderLocation } from "../types";

interface MobileLocationPincodeFormProps {
  user: User | null;
  hasSavedAddresses: boolean;
  location: HeaderLocation | null;
  pincode: string;
  setPincode: (value: string) => void;
  isCheckingPincode: boolean;
  isGettingLocation: boolean;
  onSubmitPincode: () => void;
  onUseCurrentLocation: () => void;
  onLogin: () => void;
}

export function MobileLocationPincodeForm({
  user,
  hasSavedAddresses,
  location,
  pincode,
  setPincode,
  isCheckingPincode,
  isGettingLocation,
  onSubmitPincode,
  onUseCurrentLocation,
  onLogin,
}: MobileLocationPincodeFormProps) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-gray-900">
        {user && hasSavedAddresses
          ? "Or enter a different pincode"
          : "Enter pincode"}
      </h4>
      <div className="mb-3 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="Enter 6-digit Pincode"
          value={pincode}
          onChange={(event) => setPincode(event.target.value)}
          maxLength={6}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
          onKeyDown={(event) => {
            if (event.key === "Enter") onSubmitPincode();
          }}
        />
        <button
          type="button"
          onClick={onSubmitPincode}
          disabled={isCheckingPincode || pincode.length !== 6}
          className="rounded-xl bg-black px-5 py-3 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCheckingPincode ? "..." : "Check"}
        </button>
      </div>
      <button
        type="button"
        onClick={onUseCurrentLocation}
        disabled={isGettingLocation}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-300 py-3 hover:border-black disabled:opacity-50"
      >
        <MapPin className="h-5 w-5" />
        {isGettingLocation ? "Getting location..." : "Use my current location"}
      </button>

      {location?.isServiceable !== undefined && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={`rounded-xl border-2 p-4 ${
            location.isServiceable
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-start gap-3">
            {location.isServiceable ? (
              <Check className="h-6 w-6 text-green-600" />
            ) : (
              <X className="h-6 w-6 text-red-600" />
            )}
            <div>
              <p
                className={`font-bold ${
                  location.isServiceable ? "text-green-900" : "text-red-900"
                }`}
              >
                {location.isServiceable
                  ? "Delivery Available!"
                  : "Not Serviceable"}
              </p>
              <p className="text-sm text-gray-700">
                Pincode: {location.pincode}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {!user && (
        <button
          type="button"
          onClick={onLogin}
          className="mt-6 w-full rounded-xl border-2 border-blue-200 py-3 font-semibold text-blue-600 hover:bg-blue-50"
        >
          Sign in to see your address
        </button>
      )}
    </div>
  );
}
