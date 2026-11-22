"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import VideoConsultationModal from "./video-consultationModal";
import UnifiedSearchModal from "./unifiedSearchModal";
import { useHeaderData } from "@/features/header/hooks/useHeaderData";
import { useHeaderLocation } from "@/features/header/hooks/useHeaderLocation";
import { useHeaderScroll } from "@/features/header/hooks/useHeaderScroll";
import { useHeaderMegaMenuModel } from "@/features/header/hooks/useHeaderMegaMenuModel";
import { useHeaderNavigation } from "@/features/header/hooks/useHeaderNavigation";
import { MobileHeaderBar } from "@/features/header/components/MobileHeaderBar";
import { MobileLocationSheet } from "@/features/header/components/MobileLocationSheet";
import { MobileBottomNavigation } from "@/features/header/components/MobileBottomNavigation";
import { MobileMenuDrawer } from "@/features/header/components/MobileMenuDrawer";
import { DesktopHeader } from "@/features/header/components/DesktopHeader";

function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("");
  const [activeSubNav, setActiveSubNav] = useState("");
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const mobileLocationRef = useRef<HTMLDivElement | null>(null);

  const {
    user,
    openModal,
    cartItemsCount,
    wishlistCount,
    categories,
    isCategoriesLoading: loading,
    addresses,
    defaultAddress,
    handleLogout: handleSessionLogout,
  } = useHeaderData();
  const locationState = useHeaderLocation({
    user,
    defaultAddress,
    locationModalOpen,
    onClose: () => setLocationModalOpen(false),
  });
  const {
    pathname,
    hasHeroBehindHeader,
    isScrolled,
    showNav,
    navBottom,
    navRef,
    handleHeaderEnter,
    handleHeaderLeave,
    handleCategoryHover,
  } = useHeaderScroll({
    setHoveredCategory,
    setUserMenuOpen,
    setLocationModalOpen,
    setIsHeaderHovered,
  });

  useModalScrollLock(
    locationModalOpen &&
      typeof window !== "undefined" &&
      window.innerWidth < 768 &&
      typeof CSS !== "undefined" &&
      CSS.supports("-webkit-touch-callout", "none"),
  );

  const isMyAccountPage = pathname?.startsWith("/my-account");
  const isProductDetailPage = Boolean(
    pathname?.match(/^\/products\/[^/]+$/) ||
    (pathname?.match(/^\/[^/]+\/[^/]+$/) &&
      !pathname?.startsWith("/shop/") &&
      !pathname?.startsWith("/my-account")),
  );
  const isCategoryPage = Boolean(
    pathname?.match(/^\/shop\/[^/]+$/) || pathname?.match(/^\/[^/]+\/[^/]+$/),
  );

  const { getCategoryUrl, icons } = useHeaderNavigation({
    user,
    cartItemsCount,
    wishlistCount,
    isModalOpen,
    setIsModalOpen,
  });
  const handleLogout = async () => {
    await handleSessionLogout();
    locationState.setLocation(null);
  };
  const megaMenu = useHeaderMegaMenuModel(categories, hoveredCategory);
  const isHeaderWhite =
    !hasHeroBehindHeader ||
    isScrolled ||
    isHeaderHovered ||
    Boolean(hoveredCategory) ||
    locationModalOpen ||
    userMenuOpen;
  const portalRoot =
    typeof document !== "undefined"
      ? document.getElementById("portal-root")
      : null;

  return (
    <>
      <DesktopHeader
        isHeaderWhite={isHeaderWhite}
        onMouseEnter={handleHeaderEnter}
        onMouseLeave={handleHeaderLeave}
        location={locationState.location}
        setLocation={locationState.setLocation}
        addresses={addresses}
        user={user}
        locationModalOpen={locationModalOpen}
        setLocationModalOpen={setLocationModalOpen}
        pincode={locationState.pincode}
        setPincode={locationState.setPincode}
        isCheckingPincode={locationState.isCheckingPincode}
        isGettingLocation={locationState.isGettingLocation}
        onSubmitPincode={locationState.handlePincodeSubmit}
        onUseCurrentLocation={locationState.handleUseCurrentLocation}
        onLogin={() => openModal("login")}
        icons={icons}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={setUserMenuOpen}
        onSearch={() => setIsSearchOpen(true)}
        onLogout={handleLogout}
        navRef={navRef}
        showNav={showNav}
        categories={categories}
        loading={loading}
        hoveredCategory={hoveredCategory}
        setHoveredCategory={setHoveredCategory}
        activeCategory={megaMenu.activeCategory}
        activeCategoryImages={megaMenu.activeCategoryImages}
        hasCategoryImages={megaMenu.hasCategoryImages}
        useVerticalCategoryList={megaMenu.useVerticalCategoryList}
        shouldUseGrid={megaMenu.shouldUseGrid}
        balancedTextColumns={megaMenu.balancedTextColumns}
        navBottom={navBottom}
        onHoverCategory={handleCategoryHover}
        getCategoryUrl={getCategoryUrl}
      />

      <MobileHeaderBar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isProductDetailPage={isProductDetailPage}
        isCategoryPage={isCategoryPage}
        location={locationState.location}
        onOpenLocation={() => setLocationModalOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
      <MobileLocationSheet
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        user={user}
        addresses={addresses}
        location={locationState.location}
        setLocation={locationState.setLocation}
        pincode={locationState.pincode}
        setPincode={locationState.setPincode}
        isCheckingPincode={locationState.isCheckingPincode}
        isGettingLocation={locationState.isGettingLocation}
        onSubmitPincode={locationState.handlePincodeSubmit}
        onUseCurrentLocation={locationState.handleUseCurrentLocation}
        onLogin={() => openModal("login")}
        mobileLocationRef={mobileLocationRef}
      />
      <MobileMenuDrawer
        open={mobileMenuOpen}
        portalRoot={portalRoot}
        categories={categories}
        loading={loading}
        user={user}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        activeSubNav={activeSubNav}
        setActiveSubNav={setActiveSubNav}
        getCategoryUrl={getCategoryUrl}
        onClose={() => setMobileMenuOpen(false)}
        onLogin={() => openModal("login")}
        onLogout={() => {
          setMobileMenuOpen(false);
          handleLogout();
        }}
      />
      <MobileBottomNavigation
        items={icons}
        user={user}
        pathname={pathname}
        isMyAccountPage={Boolean(isMyAccountPage)}
        isProductDetailPage={isProductDetailPage}
        isCategoryPage={isCategoryPage}
        onAccountClick={() => {
          if (!user) openModal("login");
          else {
            window.dispatchEvent(new Event("app:navigation-start"));
            router.push("/my-account");
          }
        }}
        openLogin={() => openModal("login")}
      />

      <UnifiedSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <VideoConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default Header;
