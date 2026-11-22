"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MapPin, X } from "lucide-react";
import { useOnClickOutside } from "@/hooks/useClickOutside";
import type { Address } from "@/lib/api/addresses.api";
import type { User } from "@/store/useAuthModalStore";
import type { HeaderLocation } from "../types";
import { DesktopLocationSavedAddresses } from "./DesktopLocationSavedAddresses";
import { DesktopLocationPincodeForm } from "./DesktopLocationPincodeForm";

interface Props {
  location: HeaderLocation | null;
  setLocation: (location: HeaderLocation) => void;
  addresses: Address[];
  user: User | null;
  isHeaderWhite: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  pincode: string;
  setPincode: (value: string) => void;
  isCheckingPincode: boolean;
  isGettingLocation: boolean;
  onSubmitPincode: () => void;
  onUseCurrentLocation: () => void;
  onLogin: () => void;
}

export function DesktopLocationSelector(props: Props) {
  const {
    location, setLocation, addresses, user, isHeaderWhite, open, setOpen,
    pincode, setPincode, isCheckingPincode, isGettingLocation,
    onSubmitPincode, onUseCurrentLocation, onLogin,
  } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(containerRef, () => {
    if (window.innerWidth >= 768) setOpen(false);
  });

  return (
    <div className="relative flex w-[260px] items-center gap-6">
      <div ref={containerRef} className="relative">
        <button type="button" onClick={() => setOpen(!open)} className={`flex items-center gap-1.5 text-sm transition-colors duration-300 ${isHeaderWhite ? "text-gray-700 hover:text-black" : "text-white"}`}>
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="flex flex-col items-start leading-tight">
            <span className={`text-[11px] uppercase tracking-wider ${isHeaderWhite ? "text-gray-600" : "text-white/90"}`}>Deliver to</span>
            <span className={`text-sm font-semibold ${isHeaderWhite ? "text-gray-900" : "text-white"}`}>
              {location ? `${location.city || "Your Area"} – ${location.pincode}` : "Select Location"}
            </span>
          </span>
          <ChevronDown className={`h-3.5 w-3.5 transition-all duration-200 ${isHeaderWhite ? "text-gray-400" : "text-white/80"} ${open ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute left-0 z-50 mt-3 w-96 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl">
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">Choose your location</h3>
                  <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close location selector"><X className="h-4 w-4" /></button>
                </div>
                {user && <DesktopLocationSavedAddresses addresses={addresses} setLocation={setLocation} onClose={() => setOpen(false)} />}
                <DesktopLocationPincodeForm
                  userSignedIn={Boolean(user)}
                  hasSavedAddresses={addresses.length > 0}
                  location={location}
                  pincode={pincode}
                  setPincode={setPincode}
                  isCheckingPincode={isCheckingPincode}
                  isGettingLocation={isGettingLocation}
                  onSubmitPincode={onSubmitPincode}
                  onUseCurrentLocation={onUseCurrentLocation}
                  onLogin={() => { setOpen(false); onLogin(); }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
