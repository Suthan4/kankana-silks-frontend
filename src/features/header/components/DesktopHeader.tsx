"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { RefObject } from "react";
import type { Address } from "@/lib/api/addresses.api";
import type { User } from "@/store/useAuthModalStore";
import type { Category } from "@/lib/api/category.api";
import type { HeaderLocation } from "../types";
import type { HeaderQuickLink } from "./MobileBottomNavigation";
import { DesktopLocationSelector } from "./DesktopLocationSelector";
import { DesktopAccountActions } from "./DesktopAccountActions";
import { DesktopCategoryNavigation } from "./DesktopCategoryNavigation";

interface Props {
  isHeaderWhite: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  location: HeaderLocation | null;
  setLocation: (location: HeaderLocation) => void;
  addresses: Address[];
  user: User | null;
  locationModalOpen: boolean;
  setLocationModalOpen: (open: boolean) => void;
  pincode: string;
  setPincode: (value: string) => void;
  isCheckingPincode: boolean;
  isGettingLocation: boolean;
  onSubmitPincode: () => void;
  onUseCurrentLocation: () => void;
  onLogin: () => void;
  icons: HeaderQuickLink[];
  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
  onSearch: () => void;
  onLogout: () => void;
  navRef: RefObject<HTMLElement | null>;
  showNav: boolean;
  categories: Category[];
  loading: boolean;
  hoveredCategory: string | null;
  setHoveredCategory: (categoryId: string | null) => void;
  activeCategory: Category | undefined;
  activeCategoryImages: Category[];
  hasCategoryImages: boolean;
  useVerticalCategoryList: boolean;
  shouldUseGrid: boolean;
  balancedTextColumns: Category[][];
  navBottom: number;
  onHoverCategory: (categoryId: string) => void;
  getCategoryUrl: (slug: string) => string;
}

export function DesktopHeader(props: Props) {
  const {
    isHeaderWhite, onMouseEnter, onMouseLeave, location, setLocation, addresses,
    user, locationModalOpen, setLocationModalOpen, pincode, setPincode,
    isCheckingPincode, isGettingLocation, onSubmitPincode, onUseCurrentLocation,
    onLogin, icons, userMenuOpen, setUserMenuOpen, onSearch, onLogout,
    navRef, showNav, categories, loading, hoveredCategory, setHoveredCategory,
    activeCategory, activeCategoryImages, hasCategoryImages, useVerticalCategoryList,
    shouldUseGrid, balancedTextColumns, navBottom, onHoverCategory, getCategoryUrl,
  } = props;

  return (
    <motion.header
      data-testid="desktop-header"
      initial={false}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`fixed inset-x-0 top-0 z-40 hidden transition-[background-color,color,box-shadow] duration-200 md:block ${isHeaderWhite ? "bg-background text-text-main shadow-sm" : "bg-transparent text-white shadow-none"}`}
    >
      <div className="flex items-center justify-between px-8" style={{ height: "65px" }}>
        <DesktopLocationSelector
          location={location}
          setLocation={setLocation}
          addresses={addresses}
          user={user}
          isHeaderWhite={isHeaderWhite}
          open={locationModalOpen}
          setOpen={setLocationModalOpen}
          pincode={pincode}
          setPincode={setPincode}
          isCheckingPincode={isCheckingPincode}
          isGettingLocation={isGettingLocation}
          onSubmitPincode={onSubmitPincode}
          onUseCurrentLocation={onUseCurrentLocation}
          onLogin={onLogin}
        />
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" aria-label="Kankana Silks home" className="relative block h-14 w-[180px]">
            <Image src="/removed-bg-logo.png" alt="Kankana Silks" fill priority sizes="180px" className={`object-contain transition-opacity duration-150 ${isHeaderWhite ? "opacity-100" : "opacity-0"}`} />
            <Image src="/removed-bg-logo.png" alt="" aria-hidden="true" fill priority sizes="180px" className={`object-contain brightness-0 invert transition-opacity duration-150 ${isHeaderWhite ? "opacity-0" : "opacity-100"}`} />
          </Link>
        </div>
        <DesktopAccountActions
          items={icons}
          user={user}
          isHeaderWhite={isHeaderWhite}
          userMenuOpen={userMenuOpen}
          setUserMenuOpen={setUserMenuOpen}
          openSearch={onSearch}
          openLogin={onLogin}
          onLogout={onLogout}
        />
      </div>
      <DesktopCategoryNavigation
        navRef={navRef}
        showNav={showNav}
        categories={categories}
        loading={loading}
        hoveredCategory={hoveredCategory}
        setHoveredCategory={setHoveredCategory}
        isHeaderWhite={isHeaderWhite}
        activeCategory={activeCategory}
        activeCategoryImages={activeCategoryImages}
        hasCategoryImages={hasCategoryImages}
        useVerticalCategoryList={useVerticalCategoryList}
        shouldUseGrid={shouldUseGrid}
        balancedTextColumns={balancedTextColumns}
        navBottom={navBottom}
        onHoverCategory={onHoverCategory}
        getCategoryUrl={getCategoryUrl}
      />
    </motion.header>
  );
}
