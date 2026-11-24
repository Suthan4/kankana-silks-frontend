"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Menu, X } from "lucide-react";
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
}

export function MobileHeaderBar({
  mobileMenuOpen,
  setMobileMenuOpen,
  isProductDetailPage,
  isCategoryPage,
  location,
  onOpenLocation,
  onOpenSearch,
}: MobileHeaderBarProps) {
  return (
    <motion.header
      initial={false}
      className="fixed left-0 right-0 top-0 z-40 bg-[#FDFBF9] md:hidden"
    >
      <div className="flex h-16 items-center justify-between px-5 pt-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          className="-ml-2 flex h-11 w-11 items-center justify-center p-0"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-brand-primary" />
          ) : (
            <Menu className="h-6 w-6 text-brand-primary" />
          )}
        </motion.button>
        <Link
          href="/"
          aria-label="Kankana Silks home"
          className="relative block h-10 w-[180px]"
        >
          <Image
            src="/removed-bg-logo.png"
            alt="Kankana Silks"
            fill
            priority
            sizes="180px"
            className="object-contain"
          />
        </Link>
        <div className="w-11" />
      </div>

      <div
        className={`px-5 pb-0 pt-0 transition-opacity duration-300 ${
          isProductDetailPage || isCategoryPage ? "hidden" : ""
        }`}
      >
        <motion.div
          initial={false}
          className="flex h-12 items-stretch overflow-hidden rounded-full border border-[#EADFDB] bg-white shadow-none"
        >
          <button
            onClick={onOpenLocation}
            className="relative flex max-w-[42%] shrink-0 items-center gap-2 py-0 pl-4 pr-3 active:bg-gray-50"
          >
            <span className="relative flex-shrink-0">
              <MapPin className="h-5 w-5 text-[#5E3538]" />
              {location?.isServiceable !== undefined && (
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${
                    location.isServiceable ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              )}
            </span>
            <span className="truncate text-sm font-medium text-[#4A2C2E]">
              {location ? location.pincode : "Set location"}
            </span>
          </button>
          <div className="my-2 w-px bg-[#D9CCC8]" />
          <button
            onClick={onOpenSearch}
            className="flex flex-1 items-center px-3 py-0 text-left active:bg-gray-50"
          >
            <span className="truncate text-sm text-[#7A6466]">
              Search sarees, silks…
            </span>
          </button>
        </motion.div>
      </div>
    </motion.header>
  );
}
