"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { authModalStore, useAuthModal } from "@/store/useAuthModalStore";
import Link from "next/link";
import { useOnClickOutside } from "@/hooks/useClickOutside";
import clientApiService from "@/lib/api/api.client.service";
import categoryService from "@/lib/api/category.api";
import { toast } from "@/store/useToastStore";
import { buildCategoryQuery } from "@/lib/shared/builders/productCategoryQuery.builder.ts";
import { useCartStore } from "@/store/useCartStore";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { shipmentApi } from "@/lib/api/shipment.api";
import VideoConsultationModal from "./video-consultationModal";
import { useRouter } from "next/navigation";
import UnifiedSearchModal from "./unifiedSearchModal";
import { cartApi } from "@/lib/api/cart.api";
import { wishlistApi } from "@/lib/api/wishlist.api";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("");
  const [activeSubNav, setActiveSubNav] = useState("");
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const openModal = useAuthModal((state) => state.openModal);
  const [showNav, setShowNav] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const accumulatedScrollRef = useRef(0);

  // ✅ Prevents hydration mismatch: badge counts come from localStorage/API
  // which the server doesn't have. Only render counts after first client paint.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const localCartItemsCount = useCartStore((s) => s.getTotalItems());
  const router = useRouter();

  const [location, setLocation] = useState<{
    city: string;
    pincode: string;
    isServiceable?: boolean;
  } | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const locationRef = useRef<HTMLDivElement | null>(null);
  const mobileLocationRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const { user } = useAuthModal();
  useOnClickOutside(userMenuRef, () => setUserMenuOpen(false));
  useOnClickOutside(locationRef, () => {
    if (window.innerWidth >= 768) setLocationModalOpen(false);
  });
  useOnClickOutside(mobileLocationRef, () => {
    if (window.innerWidth < 768) setLocationModalOpen(false);
  });

  const isMyAccountPage = pathname?.startsWith("/my-account");
  const isProductDetailPage = !!(
    pathname?.match(/^\/products\/[^/]+$/) ||
    (pathname?.match(/^\/[^/]+\/[^/]+$/) &&
      !pathname?.startsWith("/shop/") &&
      !pathname?.startsWith("/my-account"))
  );
  const isCategoryPage =
    pathname?.match(/^\/shop\/[^/]+$/) || pathname?.match(/^\/[^/]+\/[^/]+$/);

  // ✅ Only the homepage has a full-bleed hero sitting behind the header.
  // Everywhere else the header should just be solid white from the start.
  const hasHeroBehindHeader = pathname === "/";

  /* -------------------- STABLE SCROLL STATE -------------------- */
  const [isScrolled, setIsScrolled] = useState(!hasHeroBehindHeader);

  useEffect(() => {
    const getSafeScrollY = () => Math.max(0, window.scrollY);

    lastScrollYRef.current = getSafeScrollY();
    accumulatedScrollRef.current = 0;

    setIsScrolled(!hasHeroBehindHeader || lastScrollYRef.current > 40);
    setShowNav(lastScrollYRef.current < 80);

    const updateHeader = () => {
      const currentScrollY = getSafeScrollY();
      const delta = currentScrollY - lastScrollYRef.current;

      setIsScrolled(!hasHeroBehindHeader || currentScrollY > 40);

      // Close open header overlays as soon as the page starts moving.
      if (delta !== 0) {
        setHoveredCategory(null);
        setUserMenuOpen(false);
        setLocationModalOpen(false);
        setIsHeaderHovered(false);

        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
      }

      if (currentScrollY < 80) {
        accumulatedScrollRef.current = 0;
        setShowNav(true);
      } else if (delta !== 0) {
        const previousDirection = Math.sign(accumulatedScrollRef.current);
        const currentDirection = Math.sign(delta);

        if (previousDirection !== 0 && previousDirection !== currentDirection) {
          accumulatedScrollRef.current = 0;
        }

        accumulatedScrollRef.current += delta;

        // MacBook trackpads emit many small momentum-scroll events.
        // Accumulating them avoids rapid hide/show flicker.
        if (accumulatedScrollRef.current >= 24) {
          setShowNav(false);
          accumulatedScrollRef.current = 0;
        } else if (accumulatedScrollRef.current <= -24) {
          setShowNav(true);
          accumulatedScrollRef.current = 0;
        }
      }

      lastScrollYRef.current = currentScrollY;
      scrollRafRef.current = null;
    };

    const handleScroll = () => {
      if (scrollRafRef.current !== null) return;

      scrollRafRef.current = window.requestAnimationFrame(updateHeader);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, [hasHeroBehindHeader]);

  // When true, header should render as transparent/white-text overlay.
  const isTransparent = hasHeroBehindHeader && !isScrolled;

  /* -------------------- CART API QUERY -------------------- */
  const { data: cartData } = useQuery({
    queryKey: ["cartApi", user?.id],
    queryFn: async () => {
      const res = await cartApi.getCart();
      return res.data;
    },
    enabled: !!user,
    staleTime: 0,
    placeholderData: { items: [] }, // ✅ no undefined flash on mount
  });

  /* -------------------- WISHLIST API QUERY -------------------- */
  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      const res = await wishlistApi.getWishlist();
      return res.data;
    },
    enabled: !!user,
  });

  /* -------------------- CALCULATE COUNTS -------------------- */
  const apiCartItems = cartData?.items ?? [];
  const cartItemsCount = isMounted
    ? user
      ? apiCartItems.length
      : localCartItemsCount
    : 0;
  const wishlistCount = isMounted
    ? user
      ? (wishlistData?.totalItems ?? 0)
      : 0
    : 0;

  /* -------------------- GET DEFAULT ADDRESS -------------------- */
  const { data: addressesData } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      const response = await import("@/lib/api/addresses.api").then((mod) =>
        mod.addressApi.getAddresses(),
      );
      return response.data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    placeholderData: [],
  });

  const addresses = addressesData || [];
  const defaultAddress = addresses.find((addr) => addr.isDefault);

  /* -------------------- LOCATION LOGIC -------------------- */
  useEffect(() => {
    if (user && defaultAddress) {
      const locationData = {
        city: defaultAddress.city?.trim() || "Your Area",
        pincode: defaultAddress.pincode,
        isServiceable: true,
      };
      setLocation(locationData);
      localStorage.setItem("userLocation", JSON.stringify(locationData));
    } else if (!user) {
      const savedLocation = localStorage.getItem("userLocation");
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        setLocation({ ...parsed, city: parsed.city?.trim() || "Your Area" });
      }
    }
  }, [user, defaultAddress]);

  useEffect(() => {
    if (locationModalOpen && location?.pincode) {
      setPincode(location.pincode);
    }
  }, [locationModalOpen]);

  const checkPincodeServiceability = async (pincode: string) => {
    setIsCheckingPincode(true);
    try {
      const response = await shipmentApi.checkServiceability({
        pickupPincode: process.env.NEXT_PUBLIC_WAREHOUSE_PINCODE || "110001",
        deliveryPincode: pincode,
      });
      return response.data.serviceable;
    } catch (error) {
      console.error("Error checking pincode:", error);
      return true;
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const handlePincodeSubmit = async () => {
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    const isServiceable = await checkPincodeServiceability(pincode);
    const locationData = { city: "Your Area", pincode, isServiceable };
    setLocation(locationData);
    localStorage.setItem("userLocation", JSON.stringify(locationData));
    setPincode("");
    setLocationModalOpen(false);
    if (isServiceable) {
      toast.success("Delivery available to your location!");
    } else {
      toast.error("Sorry, delivery not available to this pincode yet");
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "User-Agent": "KankanaSilks/1.0" } },
          );
          const data = await response.json();
          const detectedPincode = data.address?.postcode;
          if (detectedPincode) {
            setPincode(detectedPincode);
            const isServiceable =
              await checkPincodeServiceability(detectedPincode);
            const locationData = {
              city: data.address?.city || data.address?.town || "Your Area",
              pincode: detectedPincode,
              isServiceable,
            };
            setLocation(locationData);
            localStorage.setItem("userLocation", JSON.stringify(locationData));
            setLocationModalOpen(false);
            if (isServiceable) {
              toast.success(
                `Location detected: ${detectedPincode}. Delivery available!`,
              );
            } else {
              toast.error(
                `Location detected: ${detectedPincode}. Not serviceable yet.`,
              );
            }
          } else {
            toast.error("Could not detect pincode from your location");
          }
        } catch (error) {
          toast.error("Failed to get location details");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location access denied.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information unavailable");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out");
            break;
          default:
            toast.error("Failed to get your location");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  /* -------------------- FETCH CATEGORIES -------------------- */
  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: async () => {
      return await categoryService.getCategoryTree();
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    placeholderData: [],
    retry: 1,
  });

  /* -------------------- HELPERS -------------------- */
  const authGuard = (cb?: () => void) => {
    if (!user) {
      openModal("login");
      return;
    }
    cb?.();
  };

  const handleLogout = async () => {
    try {
      await clientApiService.logout();
      authModalStore.getState().logout();
      localStorage.removeItem("userLocation");
      localStorage.removeItem("auth-modal-storage");
      setLocation(null);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed", 1000);
    }
  };

  const handleHeaderEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    setIsHeaderHovered(true);
  };

  const handleHeaderLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setIsHeaderHovered(false);
      setHoveredCategory(null);
      setUserMenuOpen(false);
      setLocationModalOpen(false);
    }, 100);
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

  const icons = [
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
          "https://api.whatsapp.com/send?phone=918838562459&text=Hello%20Kankana%20Silks,%20I%E2%80%99m%20interested%20in%20exploring%20your%20saree%20collection.",
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

  const navRef = useRef<HTMLElement>(null);
  const [navBottom, setNavBottom] = useState(140);

  useEffect(() => {
    const updateNavBottom = () => {
      if (navRef.current) {
        setNavBottom(navRef.current.getBoundingClientRect().bottom);
      }
    };

    updateNavBottom();
    window.addEventListener("resize", updateNavBottom);

    return () => {
      window.removeEventListener("resize", updateNavBottom);
    };
  }, [showNav]);

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
                      isHeaderWhite ? "text-gray-400" : "text-white/70"
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
                      "https://api.whatsapp.com/send?phone=918838562459&text=Hello%20Kankana%20Silks,%20I%E2%80%99m%20interested%20in%20exploring%20your%20saree%20collection.",
                      "_blank",
                    )
                  }
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
                        <p className="text-[10px] text-gray-400 truncate">
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
          aria-label="Primary navigation"
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

      {/* Mobile Header */}
      <motion.header
        initial={false}
        className={`fixed left-0 right-0 top-0 z-40 transition-[background-color,box-shadow] duration-200 md:hidden ${
          isTransparent ? "bg-transparent shadow-none" : "bg-white shadow-md"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            {mobileMenuOpen ? (
              <X
                className={`w-6 h-6 ${isTransparent ? "text-white" : "text-black"}`}
              />
            ) : (
              <Menu
                className={`w-6 h-6 ${isTransparent ? "text-white" : "text-black"}`}
              />
            )}
          </motion.button>

          <Link
            href="/"
            aria-label="Kankana Silks home"
            className="relative block h-9 w-[120px]"
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
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSearchOpen(true)}
            className="p-2"
          >
            <Search
              className={`w-5 h-5 ${isTransparent ? "text-white" : "text-black"}`}
            />
          </motion.button>
        </div>

        <div
          className={`px-4 py-2 transition-colors duration-500 ${
            isTransparent
              ? "border-t border-white/20"
              : "border-t border-gray-100"
          }${isProductDetailPage || isCategoryPage ? " hidden" : ""}`}
        >
          <button
            onClick={() => setLocationModalOpen(true)}
            className="flex items-center gap-2 text-sm"
          >
            <MapPin
              className={`w-4 h-4 ${isTransparent ? "text-white/90" : "text-gray-600"}`}
            />
            <div className="flex flex-col items-start">
              <span
                className={`text-xs ${isTransparent ? "text-white/70" : "text-gray-500"}`}
              >
                Deliver to
              </span>
              <span
                className={`font-semibold ${isTransparent ? "text-white" : "text-gray-800"}`}
              >
                {location
                  ? `${location.city} - ${location.pincode}`
                  : "Select Location"}
              </span>
            </div>
          </button>
        </div>
      </motion.header>

      {/* Mobile Location Bottom Sheet */}
      <AnimatePresence>
        {locationModalOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setLocationModalOpen(false);
              }}
            />
            <motion.div
              ref={mobileLocationRef}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-8">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
                <div className="flex justify-between mb-4">
                  <h3 className="text-xl font-bold">Choose your location</h3>
                  <button onClick={() => setLocationModalOpen(false)}>
                    <X />
                  </button>
                </div>

                {user && addresses.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Your Address
                    </h4>
                    <div className="space-y-3">
                      {addresses.map((address) => {
                        const isSelected =
                          location?.pincode === address.pincode;

                        return (
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
                            className={`w-full text-left p-4 border-2 rounded-xl transition-all
        ${
          isSelected
            ? "border-black bg-gray-50"
            : "border-gray-200 hover:border-black"
        }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-sm">
                                  {address.fullName}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {address.city} - {address.pincode}
                                </p>
                              </div>

                              {isSelected && (
                                <Check className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <Link
                      href="/my-account/addresses"
                      onClick={() => setLocationModalOpen(false)}
                      className="block mt-3 text-sm text-blue-600 font-medium text-center py-2"
                    >
                      Manage address
                    </Link>
                    <div className="border-t border-gray-200 my-4" />
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    {user && addresses.length > 0
                      ? "Or enter a different pincode"
                      : "Enter pincode"}
                  </h4>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Enter 6-digit Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      maxLength={6}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handlePincodeSubmit();
                      }}
                    />
                    <button
                      type="button"
                      onClick={handlePincodeSubmit}
                      disabled={isCheckingPincode || pincode.length !== 6}
                      className="px-5 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCheckingPincode ? "..." : "Check"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isGettingLocation}
                    className="w-full mb-4 py-3 border-2 border-gray-300 rounded-xl hover:border-black flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <MapPin className="w-5 h-5" />
                    {isGettingLocation
                      ? "Getting location..."
                      : "Use my current location"}
                  </button>

                  {location && location.isServiceable !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`p-4 rounded-xl border-2 ${location.isServiceable ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                    >
                      <div className="flex items-start gap-3">
                        {location.isServiceable ? (
                          <Check className="w-6 h-6 text-green-600" />
                        ) : (
                          <X className="w-6 h-6 text-red-600" />
                        )}
                        <div>
                          <p
                            className={`font-bold ${location.isServiceable ? "text-green-900" : "text-red-900"}`}
                          >
                            {location.isServiceable
                              ? "Delivery Available!"
                              : "Not Serviceable"}
                          </p>
                          <p className="text-sm text-gray-700">
                            Pincode: {location.pincode}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {!user && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocationModalOpen(false);
                      openModal("login");
                    }}
                    className="w-full mt-6 py-3 text-blue-600 font-semibold border-2 border-blue-200 rounded-xl hover:bg-blue-50"
                  >
                    Sign in to see your address
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-[110]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="absolute left-0 top-0 bottom-0 w-[85%] bg-white overflow-y-auto"
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
                                      const isSubOpen = activeSubNav === subKey;

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
                                              href={getCategoryUrl(sub.slug)}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {!isMyAccountPage && !isProductDetailPage && !isCategoryPage && (
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
        >
          <ul className="flex justify-around items-center py-3">
            {icons
              .filter((item) => {
                const visibleItems = !user
                  ? ["Home", "Consultation", "Cart", "Wishlist"]
                  : ["Home", "Cart", "Wishlist"];

                return visibleItems.includes(item.name);
              })
              .map((item, index) => {
                const IconComponent = item.icon;
                const isActive =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname === item.url ||
                      pathname?.startsWith(item.url + "/");

                return (
                  <li key={index} className="relative flex-1">
                    {item.type === "link" ? (
                      <Link
                        href={item.url!}
                        onClick={(e) => {
                          if (item.requiresAuth && !user) {
                            e.preventDefault();
                            openModal("login");
                          }
                        }}
                        className="flex flex-col items-center gap-1 py-2 relative"
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-black rounded-full"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                        <IconComponent
                          className={`w-5 h-5 transition-colors ${isActive ? "text-black" : "text-gray-500"}`}
                        />
                        <span
                          className={`text-[10px] font-medium transition-colors ${isActive ? "text-black" : "text-gray-500"}`}
                        >
                          {item.name}
                        </span>
                        {"badgeCount" in item && item.badgeCount! > 0 && (
                          <span className="absolute top-1 right-1/4 bg-black text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                            {item.badgeCount}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <button
                        onClick={() => item.onClick?.()}
                        className="flex flex-col items-center gap-1 py-2 w-full"
                      >
                        <IconComponent className="w-5 h-5 text-gray-500" />
                        <span className="text-[10px] text-gray-500">
                          {item.name}
                        </span>
                      </button>
                    )}
                  </li>
                );
              })}

            <li className="relative flex-1">
              <button
                onClick={() => {
                  if (!user) {
                    openModal("login");
                  } else {
                    router.push("/my-account");
                  }
                }}
                className="flex flex-col items-center gap-1 py-2 w-full relative"
              >
                {pathname?.startsWith("/my-account") && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-black rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <User
                  className={`w-5 h-5 transition-colors ${pathname?.startsWith("/my-account") ? "text-black" : "text-gray-500"}`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${pathname?.startsWith("/my-account") ? "text-black" : "text-gray-500"}`}
                >
                  {user ? "Account" : "Login"}
                </span>
              </button>
            </li>
          </ul>
        </motion.nav>
      )}

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
