"use client";

import { X } from "lucide-react";
import type { RefObject } from "react";
import type { Address } from "@/lib/api/addresses.api";
import type { User } from "@/store/useAuthModalStore";
import type { HeaderLocation } from "../types";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
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
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[calc(100dvh-env(safe-area-inset-top)-8px)] w-full gap-0 overflow-hidden rounded-t-3xl border-0 bg-white p-0 shadow-xl md:hidden"
      >
        <SheetTitle className="sr-only">Choose your location</SheetTitle>
        <div
          ref={mobileLocationRef}
          className="min-h-0 max-h-[calc(100dvh-env(safe-area-inset-top)-8px)] overflow-y-auto overscroll-contain pb-[max(24px,env(safe-area-inset-bottom))]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="p-6 pb-8">
            <div className="mb-6 flex items-center justify-center">
              <span className="h-1.5 w-12 rounded-full bg-gray-300" />
            </div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-futura-bold">
                Choose your location
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close location selector"
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
