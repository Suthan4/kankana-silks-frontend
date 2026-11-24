"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Menu, Search, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { HeaderLocation } from "../types";

interface MobileHeaderBarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
  isProductDetailPage: boolean;
  isCategoryPage: boolean;
  location: HeaderLocation | null;
  onOpenLocation: () => void;
  onOpenSearch: () => void;
  isVisible: boolean;
}

export function MobileHeaderBar({
  mobileMenuOpen,
  setMobileMenuOpen,
  isProductDetailPage,
  isCategoryPage,
  location,
  onOpenLocation,
  onOpenSearch,
  isVisible,
}: MobileHeaderBarProps) {
  return (
    <header
      aria-label="Mobile site header"
      aria-hidden={!isVisible}
      className={`home-mobile-header fixed inset-x-0 top-0 z-40 bg-[#FDFBF9] md:hidden transition-transform duration-200 ease-out ${isVisible ? "translate-y-0" : "-translate-y-full pointer-events-none"}`}
      style={{ paddingTop: "env(safe-area-inset-top)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
    >
      <div className="grid h-14 grid-cols-[44px_minmax(0,1fr)_44px] items-center px-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          className="flex h-11 w-11 items-center justify-center rounded-full text-brand-primary active:bg-black/5"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <Link href="/" aria-label="Kankana Silks home" className="relative block h-10 w-[148px] justify-self-center">
          <Image src="/removed-bg-logo.png" alt="Kankana Silks" fill priority sizes="148px" className="object-contain" />
        </Link>
        <span aria-hidden="true" className="h-11 w-11" />
      </div>

      {!isProductDetailPage && !isCategoryPage && (
        <div className="px-3 pb-3">
          <div className="grid h-12 min-w-0 grid-cols-[minmax(0,0.9fr)_1px_minmax(0,1.35fr)] items-center overflow-hidden rounded-full border border-[#EADFDB] bg-white">
            <button
              type="button"
              onClick={onOpenLocation}
              aria-label={location ? `Delivery location ${location.pincode}` : "Set delivery location"}
              className="flex h-full min-w-0 items-center gap-1.5 overflow-hidden px-3 text-left active:bg-gray-50"
            >
              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                <MapPin className="h-[18px] w-[18px] text-[#5E3538]" />
                {location?.isServiceable !== undefined && (
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${location.isServiceable ? "bg-green-500" : "bg-red-500"}`} />
                )}
              </span>
              <span className="block min-w-0 truncate text-[13px] font-medium leading-none text-[#4A2C2E]">
                {location ? location.pincode : "Set location"}
              </span>
            </button>
            <span aria-hidden="true" className="h-6 w-px bg-[#E5DAD5]" />
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search sarees and silks"
              className="flex h-full min-w-0 items-center gap-2 overflow-hidden px-3 text-left active:bg-gray-50"
            >
              <Search className="h-[17px] w-[17px] shrink-0 text-[#806D6B]" />
              <span className="min-w-0 truncate text-[13px] leading-none text-[#7A6466]">
                Search sarees, silks…
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );}
