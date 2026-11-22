"use client";

import { motion } from "framer-motion";
import { Check, MapPin, X } from "lucide-react";
import type { HeaderLocation } from "../types";

interface Props {
  userSignedIn: boolean;
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

export function DesktopLocationPincodeForm({
  userSignedIn,
  hasSavedAddresses,
  location,
  pincode,
  setPincode,
  isCheckingPincode,
  isGettingLocation,
  onSubmitPincode,
  onUseCurrentLocation,
  onLogin,
}: Props) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-900">
        {userSignedIn && hasSavedAddresses ? "Or enter a different pincode" : "Enter pincode"}
      </h4>
      <div className="mb-3 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          placeholder="6-digit pincode"
          value={pincode}
          onChange={(event) => setPincode(event.target.value)}
          maxLength={6}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          onKeyDown={(event) => { if (event.key === "Enter") onSubmitPincode(); }}
        />
        <button type="button" onClick={onSubmitPincode} disabled={isCheckingPincode || pincode.length !== 6} className="rounded-lg bg-black px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-40">
          {isCheckingPincode ? "…" : "Check"}
        </button>
      </div>
      <button type="button" onClick={onUseCurrentLocation} disabled={isGettingLocation} className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-black hover:text-black disabled:opacity-50">
        <MapPin className="h-3.5 w-3.5" />
        {isGettingLocation ? "Getting location…" : "Use my current location"}
      </button>
      {location?.isServiceable !== undefined && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className={`rounded-lg border p-3 ${location.isServiceable ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <div className="flex items-center gap-2">
            {location.isServiceable ? <Check className="h-4 w-4 flex-shrink-0 text-green-600" /> : <X className="h-4 w-4 flex-shrink-0 text-red-600" />}
            <p className={`text-xs font-semibold ${location.isServiceable ? "text-green-800" : "text-red-800"}`}>
              {location.isServiceable ? "Delivery available!" : "Not serviceable yet"}
            </p>
          </div>
        </motion.div>
      )}
      {!userSignedIn && (
        <button type="button" onClick={onLogin} className="mt-4 w-full rounded-lg border border-gray-200 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:border-black hover:text-black">
          Sign in to use your saved addresses
        </button>
      )}
    </div>
  );
}
