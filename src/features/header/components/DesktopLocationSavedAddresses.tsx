"use client";

import Link from "next/link";
import { toast } from "@/store/useToastStore";
import type { Address } from "@/lib/api/addresses.api";
import type { HeaderLocation } from "../types";

interface Props {
  addresses: Address[];
  setLocation: (location: HeaderLocation) => void;
  onClose: () => void;
}

export function DesktopLocationSavedAddresses({ addresses, setLocation, onClose }: Props) {
  if (!addresses.length) return null;
  return (
    <div className="mb-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-900">Your Addresses</h4>
      <div className="max-h-48 space-y-2 overflow-y-auto">
        {addresses.map((address) => (
          <button
            type="button"
            key={address.id}
            onClick={() => {
              const next = { city: address.city, pincode: address.pincode, isServiceable: true };
              setLocation(next);
              localStorage.setItem("userLocation", JSON.stringify(next));
              onClose();
              toast.success(`Delivering to ${address.city}, ${address.pincode}`);
            }}
            className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-black"
          >
            <span className="flex items-center justify-between">
              <span>
                <span className="block text-xs font-semibold text-gray-900">{address.fullName}</span>
                <span className="block text-xs text-gray-500">{address.city} – {address.pincode}</span>
              </span>
              {address.isDefault && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">Default</span>}
            </span>
          </button>
        ))}
      </div>
      <Link href="/my-account/addresses" onClick={onClose} className="mt-3 block py-1 text-center text-xs font-medium text-gray-500 underline underline-offset-2 hover:text-black">
        Manage addresses
      </Link>
      <div className="my-4 border-t border-gray-100" />
    </div>
  );
}
