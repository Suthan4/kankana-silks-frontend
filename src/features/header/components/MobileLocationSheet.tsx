"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { RefObject } from "react";
import type { Address } from "@/lib/api/addresses.api";
import type { User } from "@/store/useAuthModalStore";
import type { HeaderLocation } from "../types";
import { MobileLocationAddressList } from "./MobileLocationAddressList";
import { MobileLocationPincodeForm } from "./MobileLocationPincodeForm";

interface MobileLocationSheetProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  addresses: Address[];
  location: HeaderLocation | null;
  setLocation: (location: HeaderLocation) => void;
  pincode: string;
  setPincode: (value: string) => void;
  isCheckingPincode: boolean;
  isGettingLocation: boolean;
  onSubmitPincode: () => void;
  onUseCurrentLocation: () => void;
  onLogin: () => void;
  mobileLocationRef: RefObject<HTMLDivElement | null>;
}

export function MobileLocationSheet({
  open,
  onClose,
  user,
  addresses,
  location,
  setLocation,
  pincode,
  setPincode,
  isCheckingPincode,
  isGettingLocation,
  onSubmitPincode,
  onUseCurrentLocation,
  onLogin,
  mobileLocationRef,
}: MobileLocationSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="ios-location-overlay ios-modal-motion fixed inset-0 z-[100] h-[100dvh] overflow-hidden md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="ios-modal-backdrop absolute inset-0 z-10 bg-black/50"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
          />
          <motion.div
            ref={mobileLocationRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="ios-modal-panel ios-location-sheet ios-modal-motion absolute inset-x-0 bottom-0 z-20 max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)]"
            style={{ WebkitOverflowScrolling: "touch" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-6 pb-8">
              <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-gray-300" />
              <div className="mb-4 flex justify-between">
                <h3 className="text-xl font-bold">Choose your location</h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close location selector"
                >
                  <X />
                </button>
              </div>
              <MobileLocationAddressList
                addresses={addresses}
                location={location}
                setLocation={setLocation}
                onClose={onClose}
              />
              <MobileLocationPincodeForm
                user={user}
                hasSavedAddresses={addresses.length > 0}
                location={location}
                pincode={pincode}
                setPincode={setPincode}
                isCheckingPincode={isCheckingPincode}
                isGettingLocation={isGettingLocation}
                onSubmitPincode={onSubmitPincode}
                onUseCurrentLocation={onUseCurrentLocation}
                onLogin={() => {
                  onClose();
                  onLogin();
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
