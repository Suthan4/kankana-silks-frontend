"use client";
import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import {
  MessageCircle,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Search,
  ChevronDown,
  Video,
  MapPin,
  Check,
  Home,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useOnClickOutside } from "@/hooks/useClickOutside";
import { toast } from "@/store/useToastStore";
import { buildCategoryQuery } from "@/lib/shared/builders/productCategoryQuery.builder.ts";
import VideoConsultationModal from "./video-consultationModal";
import { useRouter } from "next/navigation";
import UnifiedSearchModal from "./unifiedSearchModal";
import { useHeaderData } from "@/features/header/hooks/useHeaderData";
import { useHeaderLocation } from "@/features/header/hooks/useHeaderLocation";
import { useHeaderScroll } from "@/features/header/hooks/useHeaderScroll";
import { MobileHeaderBar } from "@/features/header/components/MobileHeaderBar";
import { MobileLocationSheet } from "@/features/header/components/MobileLocationSheet";
import { MobileBottomNavigation, type HeaderQuickLink } from "@/features/header/components/MobileBottomNavigation";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("");
  const [activeSubNav, setActiveSubNav] = useState("");
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const locationRef = useRef<HTMLDivElement | null>(null);
  const mobileLocationRef = useRef<HTMLDivElement | null>(null);

  const {
    user,
    openModal,
    cartItemsCount,
    wishlistCount,
    isMounted,
    categories,
    isCategoriesLoading: loading,
    addresses,
    defaultAddress,
    handleLogout,
  } = useHeaderData();

  const {
    location,
    setLocation,
    pincode,
    setPincode,
    isCheckingPincode,
    isGettingLocation,
    handlePincodeSubmit,
    handleUseCurrentLocation,
  } = useHeaderLocation({
    user,
    defaultAddress,
    locationModalOpen,
    onClose: () => setLocationModalOpen(false),
  });

  const headerScroll = useHeaderScroll({
    setHoveredCategory,
    setUserMenuOpen,
    setLocationModalOpen,
    setIsHeaderHovered,
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
    clearHoverTimeout,
  } = headerScroll;

  useOnClickOutside(userMenuRef, () => setUserMenuOpen(false));
  useOnClickOutside(locationRef, () => {
    if (window.innerWidth >= 768) setLocationModalOpen(false);
  });
  useOnClickOutside(mobileLocationRef, () => {
    if (window.innerWidth < 768) setLocationModalOpen(false);
  });
  useModalScrollLock(
    locationModalOpen &&
      typeof window !== "undefined" &&
      window.innerWidth < 768 &&
      typeof CSS !== "undefined" &&
      CSS.supports("-webkit-touch-callout", "none"),
  );

  const isMyAccountPage = pathname?.startsWith("/my-account");
  const isProductDetailPage = !!(
    pathname?.match(/^\/products\/[^/]+$/) ||
    (pathname?.match(/^\/[^/]+\/[^/]+$/) &&
      !pathname?.startsWith("/shop/") &&
      !pathname?.startsWith("/my-account"))
  );
  const isCategoryPage =
    pathname?.match(/^\/shop\/[^/]+$/) || pathname?.match(/^\/[^/]+\/[^/]+$/);

  /* -------------------- HELPERS -------------------- */
  const authGuard = (cb?: () => void) => {
    if (!user) {
      openModal("login");
      return;
    }
    cb?.();
  };

  /* -------------------- GENERATE CATEGORY URL -------------------- */
  const getCategoryUrl = (slug: string) => {
    const queryParams = buildCategoryQuery(slug);
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return `/shop/${slug}?${searchParams.toString()}`;
  };

  const icons: HeaderQuickLink[] = [
    { name: "Home", icon: Home, type: "link", url: "/", requiresAuth: false },
    {
      name: "Consultation",
      icon: Video,
      type: "action",
      requiresAuth: false,
      onClick: () => {
        if (!user?.email) setIsModalOpen(!isModalOpen);
      },
    },
    {
      name: "Whatsapp",
      icon: MessageCircle,
      type: "action",
      requiresAuth: false,
      onClick: () => {
        window.open(
          "https://api.whatsapp.com/send?phone=916364945568&text=Hello%20Kankana%20Silks,%20I%E2%80%99m%20interested%20in%20exploring%20your%20saree%20collection.",
          "_blank",
        );
      },
    },
    {
      name: "Cart",
      icon: ShoppingCart,
      type: "link",
      url: "/cart",
      requiresAuth: false,
      badgeCount: cartItemsCount,
    },
    {
      name: "Wishlist",
      icon: Heart,
      type: "link",
      requiresAuth: false,
      url: "/wishlist",
      badgeCount: wishlistCount,
    },
  ];

  const activeCategory = categories.find((cat) => cat.id === hoveredCategory);
  const activeCategoryImages =
    activeCategory?.children?.filter((sub) => Boolean(sub.image)) ?? [];
  const hasCategoryImages =
    activeCategoryImages.length > 0 &&
    (activeCategory?.children?.length ?? 0) < 4;
  const hasGrandchildren =
    activeCategory?.children?.some(
      (sub) => sub.children && sub.children.length > 0,
    ) ?? false;
  // Categories without grandchildren display vertically.
  const useVerticalCategoryList = !hasGrandchildren;
  const balancedTextColumns = useMemo(() => {
    const childCategories = activeCategory?.children ?? [];

    if (hasCategoryImages || childCategories.length === 0) {
      return [];
    }

    type CategoryItem = (typeof childCategories)[number];

    const columnCount = Math.min(5, childCategories.length);

    const columns: Array<{
      items: CategoryItem[];
      estimatedHeight: number;
    }> = Array.from({ length: columnCount }, () => ({
      items: [],
      estimatedHeight: 0,
    }));

    childCategories.forEach((category) => {
      const grandchildrenCount = category.children?.length ?? 0;

      // Parent heading, children and spacing.
      const estimatedCategoryHeight = 48 + grandchildrenCount * 36 + 28;

      const shortestColumn = columns.reduce((shortest, current) =>
        current.estimatedHeight < shortest.estimatedHeight ? current : shortest,
      );

      shortestColumn.items.push(category);
      shortestColumn.estimatedHeight += estimatedCategoryHeight;
    });

    return columns.map((column) => column.items);
  }, [activeCategory, hasCategoryImages]);
  const totalGrandchildren =
    activeCategory?.children?.reduce(
      (acc, child) => acc + (child.children?.length || 0),
      0,
    ) ?? 0;
  const shouldUseGrid =
    (activeCategory?.children?.length ?? 0) > 4 || totalGrandchildren > 8;
  const isHeaderWhite =
    !hasHeroBehindHeader ||
    isScrolled ||
    isHeaderHovered ||
    Boolean(hoveredCategory) ||
    locationModalOpen ||
    userMenuOpen;

  // Render the mobile drawer outside the header subtree. This prevents
  // fixed-position overlays and their animations from invalidating the hero layer.
  const portalRoot =
    typeof document !== "undefined"
      ? document.getElementById("portal-root")
      : null;

  return (
    <>
      {/* ─────────────────────────────────────────────
          DESKTOP HEADER — always solid white,
          no transparent/border styling
      ───────────────────────────────────────────── */}
      <motion.header
        data-testid="desktop-header"
        initial={false}
        onMouseEnter={handleHeaderEnter}
        onMouseLeave={handleHeaderLeave}
        className={`fixed inset-x-0 top-0 z-40 hidden transition-[background-color,color,box-shadow] duration-200 md:block ${
          isHeaderWhite
            ? "bg-white text-black shadow-sm"
            : "bg-transparent text-white shadow-none"
        }`}
      >
        {/* ── SINGLE COMPACT TOP BAR ── */}
        <div
          className="flex items-center justify-between px-8"
          style={{ height: "65px" }}
        >
          {/* LEFT — Location */}
          <div className="relative flex items-center gap-6 w-[260px]">
            <div ref={locationRef} className="relative">
              <button
                onClick={() => setLocationModalOpen((p) => !p)}
                className={`flex items-center gap-1.5 text-sm transition-colors duration-300 ${
                  isHeaderWhite
                    ? "text-gray-700 hover:text-black"
                    : "text-white"
                }`}
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <div className="flex flex-col items-start leading-tight">
                  <span
                    className={`text-[11px] uppercase tracking-wider ${
                      isHeaderWhite ? "text-gray-600" : "text-white/90"
                    }`}
                  >
                    Deliver to
                  </span>
                  <span
                    className={`font-semibold text-sm ${
                      isHeaderWhite ? "text-gray-900" : "text-white"
                    }`}
                  >
                    {location
                      ? `${location.city || "Your Area"} – ${location.pincode}`
                      : "Select Location"}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-all duration-200 ${
                    isHeaderWhite ? "text-gray-400" : "text-white/80"
                  } ${locationModalOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {locationModalOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute left-0 mt-3 w-96 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100"
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-gray-900">
                          Choose your location
                        </h3>
                        <button
                          onClick={() => setLocationModalOpen(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {user && addresses.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                            Your Addresses
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {addresses.map((address) => (
                              <button
                                key={address.id}
                                onClick={() => {
                                  const locationData = {
                                    city: address.city,
                                    pincode: address.pincode,
                                    isServiceable: true,
                                  };
                                  setLocation(locationData);
                                  localStorage.setItem(
                                    "userLocation",
                                    JSON.stringify(locationData),
                                  );
                                  setLocationModalOpen(false);
                                  toast.success(
                                    `Delivering to ${address.city}, ${address.pincode}`,
                                  );
                                }}
                                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-black transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-xs text-gray-900">
                                      {address.fullName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {address.city} – {address.pincode}
                                    </p>
                                  </div>
                                  {address.isDefault && (
                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                          <Link
                            href="/my-account/addresses"
                            onClick={() => setLocationModalOpen(false)}
                            className="block mt-3 text-xs text-gray-500 hover:text-black font-medium text-center py-1 underline underline-offset-2"
                          >
                            Manage addresses
                          </Link>
                          <div className="border-t border-gray-100 my-4" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                          {user && addresses.length > 0
                            ? "Or enter a different pincode"
                            : "Enter pincode"}
                        </h4>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            placeholder="6-digit pincode"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            maxLength={6}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-sm"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") handlePincodeSubmit();
                            }}
                          />
                          <button
                            onClick={handlePincodeSubmit}
                            disabled={isCheckingPincode || pincode.length !== 6}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 text-xs font-medium"
                          >
                            {isCheckingPincode ? "…" : "Check"}
                          </button>
                        </div>
                        <button
                          onClick={handleUseCurrentLocation}
                          disabled={isGettingLocation}
                          className="w-full mb-3 py-2 border border-gray-300 rounded-lg hover:border-black transition-colors flex items-center justify-center gap-2 text-xs font-medium text-gray-600 hover:text-black disabled:opacity-50"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          {isGettingLocation
                            ? "Getting location…"
                            : "Use my current location"}
                        </button>
                        {location && location.isServiceable !== undefined && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className={`p-3 rounded-lg border ${location.isServiceable ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                          >
                            <div className="flex items-center gap-2">
                              {location.isServiceable ? (
                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                              )}
                              <p
                                className={`text-xs font-semibold ${location.isServiceable ? "text-green-800" : "text-red-800"}`}
                              >
                                {location.isServiceable
                                  ? "Delivery available!"
                                  : "Not serviceable yet"}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                      {!user && (
                        <button
                          onClick={() => {
                            setLocationModalOpen(false);
                            openModal("login");
                          }}
                          className="w-full mt-4 py-2.5 text-xs text-gray-600 hover:text-black font-medium border border-gray-200 rounded-lg hover:border-black transition-colors"
                        >
                          Sign in to use your saved addresses
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* CENTER — Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              aria-label="Kankana Silks home"
              className="relative block h-14 w-[180px]"
            >
              <Image
                src="/removed-bg-logo.png"
                alt="Kankana Silks"
                fill
                priority
                sizes="180px"
                className={`object-contain transition-opacity duration-150 ${
                  isHeaderWhite ? "opacity-100" : "opacity-0"
                }`}
              />

              <Image
                src="/removed-bg-logo.png"
                alt=""
                aria-hidden="true"
                fill
                priority
                sizes="180px"
                className={`object-contain brightness-0 invert transition-opacity duration-150 ${
                  isHeaderWhite ? "opacity-0" : "opacity-100"
                }`}
              />
            </Link>
          </div>

          {/* RIGHT — Search + Icons + User */}
          <div className="flex items-center gap-4 flex-shrink-0 justify-end">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`flex min-w-[160px] items-center gap-2 rounded-full border px-4 py-2 text-sm transition-[background-color,border-color,color] duration-200 ${
                isHeaderWhite
                  ? "border-gray-200 bg-gray-50 text-gray-500 hover:bg-white hover:border-gray-400 hover:text-gray-700"
                  : "border-white/50 bg-black/10 text-white hover:bg-white/10 hover:border-white"
              }`}
            >
              <Search className="w-4 h-4 flex-shrink-0" />
              <span>Search…</span>
            </button>
            <div className="flex items-center justify-center gap-3 h-full">
              {/* Cart / Wishlist */}
              {icons
                .filter((i) => ["Cart", "Wishlist"].includes(i.name))
                .map((item) => {
                  const Icon = item.icon;
                  const Btn = (
                    <div className="relative group">
                      <motion.button
                        whileHover={{ scale: 0.92 }}
                        whileTap={{ scale: 0.86 }}
                        onClick={() => {
                          if (item.requiresAuth) authGuard(item.onClick);
                          else item.onClick?.();
                        }}
                        aria-label={
                          "badgeCount" in item && item.badgeCount! > 0
                            ? `${item.name}, ${item.badgeCount} items`
                            : item.name
                        }
                        className={`relative flex items-center justify-center w-10 h-10 transition-colors duration-300 ${
                          isHeaderWhite
                            ? "text-gray-700 hover:text-black"
                            : "text-white"
                        }`}
                      >
                        <Icon style={{ width: "20px", height: "20px" }} />
                        {"badgeCount" in item && item.badgeCount! > 0 && (
                          <span className="absolute -top-[0.1rem] -right-[0.1rem] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium bg-black text-white">
                            {item.badgeCount}
                          </span>
                        )}
                      </motion.button>

                      {/* Tooltip */}
                      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-0.5 z-[50] whitespace-nowrap rounded-full bg-black/95 px-3 py-1.5 text-[10px] font-medium tracking-[0.08em] text-white opacity-0 shadow-lg transition-all duration-200 -translate-y-1 group-hover:translate-y-0 group-hover:opacity-100">
                        {item.name}
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-black/95" />
                      </span>
                    </div>
                  );

                  if (item.type === "link") {
                    return (
                      <Link
                        key={item.name}
                        href={item.url!}
                        onClick={(e) => {
                          if (item.requiresAuth && !user) {
                            e.preventDefault();
                            openModal("login");
                          }
                        }}
                      >
                        {Btn}
                      </Link>
                    );
                  }
                  return <div key={item.name}>{Btn}</div>;
                })}

              <div className="relative group">
                <motion.button
                  whileHover={{ scale: 0.92 }}
                  whileTap={{ scale: 0.86 }}
                  onClick={() =>
                    window.open(
                      "https://api.whatsapp.com/send?phone=916364945568&text=Hello%20Kankana%20Silks,%20I%E2%80%99m%20interested%20in%20exploring%20your%20saree%20collection.",
                      "_blank",
                    )
                  }
                  aria-label="Chat with us on WhatsApp"
                  className={`flex items-center justify-center w-10 h-10 transition-colors duration-300 ${
                    isHeaderWhite
                      ? "text-gray-700 hover:text-black"
                      : "text-white"
                  }`}
                >
                  <MessageCircle style={{ width: "20px", height: "20px" }} />
                </motion.button>

                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-0.5 z-[50] whitespace-nowrap rounded-full bg-black/95 px-3 py-1.5 text-[10px] font-medium tracking-[0.08em] text-white opacity-0 shadow-lg transition-all duration-200 -translate-y-1 group-hover:translate-y-0 group-hover:opacity-100">
                  Connect on WhatsApp
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-black/95" />
                </span>
              </div>

              {/* User */}
              <div
                className="relative group"
                onMouseEnter={() => user && setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button
                  onClick={() => {
                    if (!user) openModal("login");
                    else setUserMenuOpen((p) => !p);
                  }}
                  aria-label={user ? "Open account menu" : "Sign in"}
                  className={`flex items-center justify-center gap-1 h-10 px-1 transition-colors duration-300 ${
                    isHeaderWhite
                      ? "text-gray-700 hover:text-black"
                      : "text-white"
                  }`}
                >
                  {!user && <User style={{ width: "20px", height: "20px" }} />}
                  {!user && (
                    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-0.5 z-[50] whitespace-nowrap rounded-full bg-black/95 px-3 py-1.5 text-[10px] font-medium tracking-[0.08em] text-white opacity-0 shadow-lg transition-all duration-200 -translate-y-1 group-hover:translate-y-0 group-hover:opacity-100">
                      Sign In
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-black/95" />
                    </span>
                  )}
                  {user && (
                    <>
                      <span
                        className={`text-sm font-semibold hidden lg:block ${
                          isHeaderWhite ? "text-gray-900" : "text-white"
                        }`}
                      >
                        {user.firstName}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </>
                  )}
                </button>
                <AnimatePresence>
                  {user && userMenuOpen && (
                    <motion.div
                      ref={userMenuRef}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-900">
                          {user.firstName}
                        </p>
                        <p className="text-[10px] text-gray-600 truncate">
                          {" "}
                          {user.email}
                        </p>
                      </div>
                      {[
                        ["My Account", "/my-account"],
                        ["My Orders", "/my-account/orders"],
                        ["Addresses", "/my-account/addresses"],
                      ].map(([label, href]) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors text-gray-700 hover:text-black"
                        >
                          {label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* ── NAV BAR — Sabyasachi style ── */}
        <motion.nav
          ref={navRef}
          data-testid="desktop-nav"
          aria-label="Main"
          initial={false}
          animate={{
            opacity: showNav ? 1 : 0,
            y: showNav ? 0 : -6,
          }}
          transition={{
            duration: 0.16,
            ease: [0.22, 1, 0.36, 1],
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setHoveredCategory(null);
            }
          }}
          style={{
            height: showNav ? 42 : 0,
          }}
          className={`relative z-40 hidden md:block ${
            showNav
              ? "pointer-events-auto overflow-visible"
              : "pointer-events-none overflow-hidden"
          }`}
        >
          {/* Navigation links */}
          <div className="h-10 overflow-hidden">
            <ul className="flex h-10 items-center justify-center gap-2">
              {loading ? (
                [80, 100, 72, 88, 96, 76].map((width, index) => (
                  <li key={index} className="px-5">
                    <div
                      className="h-3 animate-pulse rounded-full bg-gray-200/70"
                      style={{
                        width: `${width}px`,
                      }}
                    />
                  </li>
                ))
              ) : categories.length === 0 ? (
                <li className="text-base text-gray-400">
                  No categories available
                </li>
              ) : (
                categories.map((category) => {
                  const isActive = hoveredCategory === category.id;

                  return (
                    <li
                      key={category.id}
                      onMouseEnter={() => {
                        if (hoverTimeoutRef.current) {
                          clearTimeout(hoverTimeoutRef.current);
                        }

                        setHoveredCategory(category.id);

                        if (navRef.current) {
                          setNavBottom(
                            navRef.current.getBoundingClientRect().bottom,
                          );
                        }
                      }}
                      className="relative flex h-full items-center"
                    >
                      <Link
                        href={getCategoryUrl(category.slug)}
                        onFocus={() => {
                          setHoveredCategory(category.id);

                          if (navRef.current) {
                            setNavBottom(
                              navRef.current.getBoundingClientRect().bottom,
                            );
                          }
                        }}
                        className={`relative flex h-14 items-center px-5 text-sm font-medium uppercase tracking-[0.12em] transition-colors duration-300 ${
                          isHeaderWhite
                            ? isActive
                              ? "text-black"
                              : "text-black hover:text-black"
                            : "text-white hover:text-white"
                        }`}
                      >
                        {category.name}
                      </Link>

                      {/* {isActive && (
                        <motion.span
                          layoutId="desktopNavUnderline"
                          className={`pointer-events-none absolute inset-x-4 bottom-0 z-[60] h-[2px] ${
                            isHeaderWhite ? "bg-black" : "bg-white"
                          }`}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 42,
                          }}
                        />
                      )} */}
                      <motion.span
                        aria-hidden="true"
                        initial={false}
                        animate={{
                          width: isActive ? "calc(100% - 32px)" : "10px",
                          opacity: isActive ? 1 : 0.65,
                        }}
                        transition={{
                          width: {
                            duration: 0.28,
                            ease: [0.22, 1, 0.36, 1],
                          },
                          opacity: {
                            duration: 0.2,
                          },
                        }}
                        className={`pointer-events-none absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 rounded-full ${
                          isHeaderWhite
                            ? "bg-black"
                            : "bg-white shadow-[0_0_8px_rgba(255,255,255,0.65)]"
                        }`}
                      />
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          {/* Mega menu */}
          <AnimatePresence>
            {hoveredCategory && activeCategory && (
              <>
                {/* Page overlay */}
                <motion.div
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.18,
                  }}
                  className="pointer-events-none absolute inset-x-0 top-full z-40 h-screen bg-black/30"
                />

                {/* Dropdown */}
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -6,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    maxHeight:
                      navBottom > 0
                        ? `calc(100dvh - ${navBottom}px)`
                        : "calc(100dvh - 150px)",
                  }}
                  className="absolute inset-x-0 top-full z-50 overflow-hidden border-t border-gray-200 bg-white text-black shadow-xl"
                >
                  <div
                    style={{
                      maxHeight:
                        navBottom > 0
                          ? `calc(100dvh - ${navBottom}px)`
                          : "calc(100dvh - 150px)",
                    }}
                    className="mx-auto w-full max-w-[1600px] overflow-hidden"
                  >
                    {activeCategory.children &&
                    activeCategory.children.length > 0 ? (
                      <div
                        style={{
                          maxHeight:
                            navBottom > 0
                              ? `calc(100dvh - ${navBottom}px)`
                              : "calc(100dvh - 150px)",
                        }}
                        className={`grid overflow-hidden ${
                          !hasCategoryImages
                            ? "grid-cols-1"
                            : useVerticalCategoryList
                              ? "min-h-[445px] grid-cols-[280px_minmax(0,1fr)]"
                              : "min-h-[445px] grid-cols-[minmax(380px,1fr)_minmax(700px,900px)]"
                        }`}
                      >
                        {/* Left category section */}
                        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
                          {/* Scrollable category links */}
                          <div
                            className={
                              !hasCategoryImages
                                ? "h-[440px] overflow-y-auto px-8 py-7 lg:px-10 2xl:h-[470px]"
                                : useVerticalCategoryList
                                  ? "min-h-0 flex-1 overflow-y-auto px-10 py-9"
                                  : "min-h-0 flex-1 overflow-y-auto px-8 py-9 lg:px-10"
                            }
                          >
                            {!hasCategoryImages ? (
                              <div className="grid grid-cols-2 items-start gap-x-8 gap-y-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-x-10">
                                {balancedTextColumns.map(
                                  (column, columnIndex) => (
                                    <div
                                      key={`category-column-${columnIndex}`}
                                      className="flex min-w-0 flex-col gap-7"
                                    >
                                      {column.map((sub, itemIndex) => (
                                        <motion.div
                                          key={sub.id}
                                          initial={{
                                            opacity: 0,
                                            y: 8,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            y: 0,
                                          }}
                                          transition={{
                                            duration: 0.16,
                                            delay:
                                              (columnIndex + itemIndex) * 0.025,
                                          }}
                                          className="min-w-0"
                                        >
                                          {/* Parent category */}
                                          <Link
                                            href={getCategoryUrl(sub.slug)}
                                            onClick={() => {
                                              setHoveredCategory(null);
                                            }}
                                            className="group flex w-fit items-center gap-2 text-base font-semibold tracking-wide text-gray-900"
                                          >
                                            <span className="h-[1.5px] w-0 shrink-0 bg-black transition-all duration-200 group-hover:w-4" />

                                            <span className="transition-colors duration-200 group-hover:text-black">
                                              {sub.name}
                                            </span>
                                          </Link>

                                          {/* Subcategories */}
                                          {sub.children &&
                                            sub.children.length > 0 && (
                                              <ul className="mt-3 flex flex-col gap-2.5 border-l border-gray-100 pl-4">
                                                {sub.children.map(
                                                  (
                                                    grandchild,
                                                    grandchildIndex,
                                                  ) => (
                                                    <motion.li
                                                      key={grandchild.id}
                                                      initial={{
                                                        opacity: 0,
                                                        x: -5,
                                                      }}
                                                      animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                      }}
                                                      transition={{
                                                        duration: 0.12,
                                                        delay:
                                                          grandchildIndex *
                                                          0.015,
                                                      }}
                                                    >
                                                      <Link
                                                        href={getCategoryUrl(
                                                          grandchild.slug,
                                                        )}
                                                        onClick={() => {
                                                          setHoveredCategory(
                                                            null,
                                                          );
                                                        }}
                                                        className="block text-[15px] leading-6 text-gray-500 transition-colors duration-200 hover:text-black"
                                                      >
                                                        {grandchild.name}
                                                      </Link>
                                                    </motion.li>
                                                  ),
                                                )}
                                              </ul>
                                            )}
                                        </motion.div>
                                      ))}
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              <div
                                className={
                                  useVerticalCategoryList
                                    ? "flex flex-col items-start gap-6"
                                    : shouldUseGrid
                                      ? "grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-3 xl:grid-cols-4"
                                      : "grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
                                }
                              >
                                {activeCategory.children.map((sub, index) => (
                                  <motion.div
                                    key={sub.id}
                                    initial={{
                                      opacity: 0,
                                      y: 8,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                    }}
                                    transition={{
                                      duration: 0.16,
                                      delay: index * 0.025,
                                    }}
                                    className={
                                      useVerticalCategoryList
                                        ? "w-full"
                                        : "min-w-0"
                                    }
                                  >
                                    <Link
                                      href={getCategoryUrl(sub.slug)}
                                      onClick={() => {
                                        setHoveredCategory(null);
                                      }}
                                      className="group flex w-fit items-center gap-2 text-base font-semibold tracking-wide text-gray-900"
                                    >
                                      <span className="h-[1.5px] w-0 shrink-0 bg-black transition-all duration-200 group-hover:w-4" />

                                      <span className="transition-colors duration-200 group-hover:text-black">
                                        {sub.name}
                                      </span>
                                    </Link>

                                    {sub.children &&
                                      sub.children.length > 0 && (
                                        <ul className="mt-3 flex flex-col gap-3 border-l border-gray-100 pl-4">
                                          {sub.children.map((grandchild) => (
                                            <li key={grandchild.id}>
                                              <Link
                                                href={getCategoryUrl(
                                                  grandchild.slug,
                                                )}
                                                onClick={() => {
                                                  setHoveredCategory(null);
                                                }}
                                                className="block text-[15px] leading-6 text-gray-500 transition-colors duration-200 hover:text-black"
                                              >
                                                {grandchild.name}
                                              </Link>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Always-visible View All */}
                          <div className="sticky bottom-0 z-10 shrink-0 border-t border-gray-200 bg-white px-10 py-4">
                            <Link
                              href={getCategoryUrl(activeCategory.slug)}
                              onClick={() => {
                                setHoveredCategory(null);
                              }}
                              className="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-black"
                            >
                              <span className="border-b border-transparent transition-colors duration-200 group-hover:border-black">
                                View All
                              </span>

                              <span className="transition-transform duration-200 group-hover:translate-x-1">
                                →
                              </span>
                            </Link>
                          </div>
                        </section>

                        {/* Right portrait images */}
                        {hasCategoryImages && (
                          <aside className="min-h-0 overflow-y-auto border-l border-gray-200 px-6 py-8 lg:px-8 xl:px-10">
                            <div
                              className={`grid w-fit content-start justify-start gap-x-5 gap-y-8 ${
                                activeCategoryImages.length === 1
                                  ? "grid-cols-1"
                                  : activeCategoryImages.length === 2
                                    ? "grid-cols-2"
                                    : "grid-cols-3"
                              }`}
                            >
                              {activeCategoryImages.map((sub, index) => (
                                <motion.article
                                  key={sub.id}
                                  initial={{
                                    opacity: 0,
                                    y: 12,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                  }}
                                  transition={{
                                    duration: 0.22,
                                    delay: index * 0.05,
                                    ease: [0.22, 1, 0.36, 1],
                                  }}
                                  className="w-[190px] lg:w-[210px] xl:w-[240px] 2xl:w-[250px]"
                                >
                                  <Link
                                    href={getCategoryUrl(sub.slug)}
                                    onClick={() => {
                                      setHoveredCategory(null);
                                    }}
                                    className="group block"
                                  >
                                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f4f4f4]">
                                      <Image
                                        src={sub.image!}
                                        alt={sub.name}
                                        fill
                                        sizes="(min-width: 1536px) 250px, (min-width: 1280px) 240px, (min-width: 1024px) 210px, 190px"
                                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                                      />
                                    </div>

                                    <h3 className="mt-3 whitespace-normal text-[13px] font-semibold uppercase leading-[1.4] tracking-[0.09em] text-gray-900">
                                      {sub.name}
                                    </h3>
                                  </Link>
                                </motion.article>
                              ))}
                            </div>
                          </aside>
                        )}
                      </div>
                    ) : (
                      /* Category without children */
                      <section
                        style={{
                          maxHeight:
                            navBottom > 0
                              ? `calc(100dvh - ${navBottom}px)`
                              : "calc(100dvh - 150px)",
                        }}
                        className="flex min-h-[400px] items-stretch overflow-hidden"
                      >
                        {activeCategory.image && (
                          <div className="relative aspect-[640/894] w-[340px] shrink-0 overflow-hidden bg-gray-100">
                            <Image
                              src={activeCategory.image}
                              alt={activeCategory.name}
                              fill
                              sizes="340px"
                              className="object-cover object-center transition-transform duration-700 hover:scale-[1.025]"
                            />

                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
                          </div>
                        )}

                        <div className="flex max-w-xl flex-col justify-center overflow-y-auto px-12 py-12">
                          <span className="mb-5 block h-[2px] w-8 bg-[#c4a882]" />

                          <h3 className="mb-4 font-serif text-3xl font-light uppercase tracking-[0.18em] text-gray-900">
                            {activeCategory.name}
                          </h3>

                          {activeCategory.description && (
                            <p className="line-clamp-4 text-base leading-relaxed text-gray-500">
                              {activeCategory.description}
                            </p>
                          )}

                          <Link
                            href={getCategoryUrl(activeCategory.slug)}
                            onClick={() => {
                              setHoveredCategory(null);
                            }}
                            className="group mt-8 inline-flex w-fit items-center gap-3 text-sm font-semibold uppercase tracking-[0.16em] text-black"
                          >
                            <span className="border-b border-transparent transition-colors duration-200 group-hover:border-black">
                              Explore Collection
                            </span>

                            <span className="transition-transform duration-200 group-hover:translate-x-1">
                              →
                            </span>
                          </Link>
                        </div>
                      </section>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.nav>
      </motion.header>

      <MobileHeaderBar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} isProductDetailPage={Boolean(isProductDetailPage)} isCategoryPage={Boolean(isCategoryPage)} location={location} onOpenLocation={() => setLocationModalOpen(true)} onOpenSearch={() => setIsSearchOpen(true)}/>
      <MobileLocationSheet open={locationModalOpen} onClose={() => setLocationModalOpen(false)} user={user} addresses={addresses} location={location} setLocation={setLocation} pincode={pincode} setPincode={setPincode} isCheckingPincode={isCheckingPincode} isGettingLocation={isGettingLocation} onSubmitPincode={handlePincodeSubmit} onUseCurrentLocation={handleUseCurrentLocation} onLogin={() => openModal("login")} mobileLocationRef={mobileLocationRef}/>
      {/* Mobile Menu: portal-isolated from the page and hero slider. */}
      {portalRoot &&
        createPortal(
          <AnimatePresence initial={false}>
            {mobileMenuOpen && (
              <div
                className="md:hidden fixed inset-0 z-[110] isolate"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 110,
                  isolation: "isolate",
                  contain: "layout paint",
                  transform: "translate3d(0, 0, 0)",
                  WebkitTransform: "translate3d(0, 0, 0)",
                }}
              >
                {/* Static backdrop: avoid animating opacity over the large hero image. */}
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  className="absolute inset-0 h-full w-full touch-none bg-black/50"
                  onClick={() => setMobileMenuOpen(false)}
                />
                {/* Animate only the drawer layer, not the full-screen overlay. */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  className="mobile-drawer-panel absolute inset-y-0 left-0 w-[85%] max-w-[420px] overflow-y-auto overscroll-contain bg-white pb-[env(safe-area-inset-bottom)]"
                  style={{ WebkitOverflowScrolling: "touch" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-6">
                    <button
                      className="mb-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <X />
                    </button>

                    {user && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-gray-900">
                          Hello, {user.firstName}!
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="mt-3 space-y-2">
                          <Link
                            href="/my-account"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-sm text-gray-700 hover:text-black"
                          >
                            My Account
                          </Link>
                          <Link
                            href="/my-account/orders"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-sm text-gray-700 hover:text-black"
                          >
                            My Orders
                          </Link>
                          <Link
                            href="/my-account/addresses"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-sm text-gray-700 hover:text-black"
                          >
                            Address
                          </Link>
                          <button
                            onClick={() => {
                              setMobileMenuOpen(false);
                              handleLogout();
                            }}
                            className="block w-full text-left text-sm text-red-600"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}

                    {!user && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          openModal("login");
                        }}
                        className="w-full mb-6 py-3 bg-black text-white rounded-lg font-semibold"
                      >
                        Sign In / Sign Up
                      </button>
                    )}

                    <div className="space-y-1">
                      {loading ? (
                        <>
                          {[120, 90, 110, 80, 100].map((w, i) => (
                            <div
                              key={i}
                              className="border-b border-gray-100 px-1 py-5"
                            >
                              <div
                                className="h-4 rounded-full bg-gray-200 animate-pulse"
                                style={{ width: `${w}px` }}
                              />
                            </div>
                          ))}
                        </>
                      ) : (
                        categories.map((category) => {
                          const isOpen = activeNav === category.name;

                          return (
                            <div
                              key={category.id}
                              className="border-b border-gray-200"
                            >
                              <div className="flex items-center">
                                {(category.children?.length ?? 0) > 0 && (
                                  <button
                                    onClick={() =>
                                      setActiveNav(isOpen ? "" : category.name)
                                    }
                                    className="flex h-12 w-10 shrink-0 items-center justify-center"
                                  >
                                    <span className="relative h-4 w-4">
                                      <span className="absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 bg-black" />
                                      {!isOpen && (
                                        <span className="absolute left-1/2 top-0 h-4 w-[1.5px] -translate-x-1/2 bg-black" />
                                      )}
                                    </span>
                                  </button>
                                )}

                                <Link
                                  href={getCategoryUrl(category.slug)}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex-1 py-2 text-[15px] font-medium uppercase tracking-[0.08em] text-black"
                                >
                                  {category.name}
                                </Link>
                              </div>

                              <AnimatePresence initial={false}>
                                {isOpen && category.children && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pb-4 pl-10 pr-4">
                                      <div className="space-y-5">
                                        {category.children.map((sub) => {
                                          const subKey = `${category.name}-${sub.name}`;
                                          const isSubOpen =
                                            activeSubNav === subKey;

                                          return (
                                            <div key={sub.id}>
                                              <div className="flex items-center">
                                                {(sub.children?.length ?? 0) >
                                                  0 && (
                                                  <button
                                                    onClick={() =>
                                                      setActiveSubNav(
                                                        isSubOpen ? "" : subKey,
                                                      )
                                                    }
                                                    className="mr-2 flex h-8 w-6 shrink-0 items-center justify-center"
                                                  >
                                                    <span className="relative h-3 w-3">
                                                      <span className="absolute left-0 top-1/2 h-[1.5px] w-3 -translate-y-1/2 bg-black" />
                                                      {!isSubOpen && (
                                                        <span className="absolute left-1/2 top-0 h-3 w-[1.5px] -translate-x-1/2 bg-black" />
                                                      )}
                                                    </span>
                                                  </button>
                                                )}

                                                <Link
                                                  href={getCategoryUrl(
                                                    sub.slug,
                                                  )}
                                                  onClick={() =>
                                                    setMobileMenuOpen(false)
                                                  }
                                                  className="text-[14px] font-medium uppercase tracking-[0.06em] text-black"
                                                >
                                                  {sub.name}
                                                </Link>
                                              </div>

                                              <AnimatePresence initial={false}>
                                                {isSubOpen &&
                                                  sub.children &&
                                                  sub.children.length > 0 && (
                                                    <motion.div
                                                      initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                      }}
                                                      animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                      }}
                                                      exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                      }}
                                                      transition={{
                                                        duration: 0.2,
                                                      }}
                                                      className="overflow-hidden"
                                                    >
                                                      <div className="mt-3 space-y-3 pl-8">
                                                        {sub.children.map(
                                                          (grand) => (
                                                            <Link
                                                              key={grand.id}
                                                              href={getCategoryUrl(
                                                                grand.slug,
                                                              )}
                                                              onClick={() =>
                                                                setMobileMenuOpen(
                                                                  false,
                                                                )
                                                              }
                                                              className="block text-[12px] uppercase tracking-[0.05em] text-gray-500"
                                                            >
                                                              {grand.name}
                                                            </Link>
                                                          ),
                                                        )}
                                                      </div>
                                                    </motion.div>
                                                  )}
                                              </AnimatePresence>
                                            </div>
                                          );
                                        })}
                                      </div>

                                      <Link
                                        href={getCategoryUrl(category.slug)}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="mt-5 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-black"
                                      >
                                        View All →
                                      </Link>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          portalRoot,
        )}

      <MobileBottomNavigation items={icons} user={user} pathname={pathname} isMyAccountPage={Boolean(isMyAccountPage)} isProductDetailPage={Boolean(isProductDetailPage)} isCategoryPage={Boolean(isCategoryPage)} onAccountClick={() => { if (!user) openModal("login"); else { window.dispatchEvent(new Event("app:navigation-start")); router.push("/my-account"); } }} openLogin={() => openModal("login")}/>
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
