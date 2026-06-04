"use client";
import { Fragment, useEffect, useRef, useState } from "react";
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
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const openModal = useAuthModal((state) => state.openModal);
  const [showNav, setShowNav] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    // placeholderData: {
    //   id: "",
    //   userId: "",
    //   isPublic: false,
    //   items: [],
    //   totalItems: 0,
    // },
  });

  /* -------------------- CALCULATE COUNTS -------------------- */
  // isMounted guard: server renders 0 (no localStorage/API).
  // Client reads real values after hydration — prevents SSR mismatch.
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
    placeholderData: [], // ✅ avoids null guard issues
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
  // ✅ 1hr staleTime — categories don't change often, no refetch on every visit
  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: async () => {
      return await categoryService.getCategoryTree();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours in cache
    placeholderData: [], // ✅ render nav bar immediately
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

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNavbar = () => {
      const currentScrollY = window.scrollY;

      // Always show near top
      if (currentScrollY < 80) {
        setShowNav(true);
      }
      // Hide only after meaningful downward scroll
      else if (currentScrollY > lastScrollY + 12) {
        setShowNav(false);

        // Close megamenu while hiding
        setHoveredCategory(null);

        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
      }
      // Show only after meaningful upward scroll
      else if (currentScrollY < lastScrollY - 12) {
        setShowNav(true);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
    {
      name: "Home",
      icon: Home,
      type: "link",
      url: "/",
      requiresAuth: false,
    },
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

  {
    /* Navigation Bar */
  }
  const navRef = useRef<HTMLElement>(null);
  const [navBottom, setNavBottom] = useState(140);

  // ✅ Track nav bottom position dynamically
  useEffect(() => {
    const updateNavBottom = () => {
      if (navRef.current) {
        // setNavBottom(navRef.current.getBoundingClientRect().bottom);
      }
    };
    updateNavBottom();
    window.addEventListener("resize", updateNavBottom);
    window.addEventListener("scroll", updateNavBottom, { passive: true });
    return () => {
      window.removeEventListener("resize", updateNavBottom);
      window.removeEventListener("scroll", updateNavBottom);
    };
  }, [showNav]);

  // ✅ Close dropdown on scroll
  useEffect(() => {
    const close = () => setHoveredCategory(null);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, []);

  // Find the currently hovered category object
  const activeCategory = categories.find((cat) => cat.id === hoveredCategory);
  const totalGrandchildren =
    activeCategory?.children?.reduce(
      (acc, child) => acc + (child.children?.length || 0),
      0,
    ) ?? 0;

  const shouldUseGrid =
    (activeCategory?.children?.length || 0) > 4 || totalGrandchildren > 8;

  return (
    <>
      {/* ─────────────────────────────────────────────
          DESKTOP HEADER
      ───────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="hidden md:block sticky top-0 z-40 bg-white"
      >
        {/* ── SINGLE COMPACT TOP BAR ── */}
        <div
          className="flex items-center justify-between px-8 border-b border-gray-200"
          style={{ height: "62px" }}
        >
          {/* LEFT — Location */}
          <div className="relative flex items-center gap-6 w-[260px]">
            <div className="relative">
              <button
                onClick={() => setLocationModalOpen((p) => !p)}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-black transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Deliver to
                  </span>
                  <span className="font-semibold text-gray-900 text-xs">
                    {location
                      ? `${location.city || "Your Area"} – ${location.pincode}`
                      : "Select Location"}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${locationModalOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {locationModalOpen && (
                  <motion.div
                    ref={locationRef}
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
            <Link href="/">
              <motion.img
                src="/image-removebg-preview.png"
                alt="Kankana Silks"
                layoutId="desktop-logo"
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  mass: 0.6,
                }}
                className="h-14 lg:h-12 w-auto object-contain hidden md:block"
              />
            </Link>
          </div>

          {/* RIGHT — Search + Icons + User */}
          <div className="flex items-center gap-4 flex-shrink-0 justify-end">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-400 transition-all text-xs text-gray-400 hover:text-gray-600 min-w-[150px]"
            >
              <Search className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Search…</span>
            </button>
            <div className="flex items-center justify-center gap-3 h-full">
              {/* Cart */}
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
                        className="relative flex items-center justify-center w-9 h-9 text-gray-600 hover:text-black transition-colors"
                      >
                        <Icon style={{ width: "18px", height: "18px" }} />
                        {"badgeCount" in item && item.badgeCount! > 0 && (
                          <span className="absolute -top-[0.1rem] -right-[0.1rem] bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
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
                  className="flex items-center justify-center w-9 h-9 text-gray-600 hover:text-black transition-colors"
                >
                  <MessageCircle style={{ width: "18px", height: "18px" }} />
                </motion.button>

                {/* Tooltip */}
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-0.5 z-[50] whitespace-nowrap rounded-full bg-black/95 px-3 py-1.5 text-[10px] font-medium tracking-[0.08em] text-white opacity-0 shadow-lg transition-all duration-200 -translate-y-1 group-hover:translate-y-0 group-hover:opacity-100">
                  Connect on WhatsApp
                  {/* Arrow pointing UP toward button */}
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
                  className="flex items-center justify-center gap-1 h-9 px-1 text-gray-600 hover:text-black transition-colors"
                >
                  {!user && <User style={{ width: "18px", height: "18px" }} />}
                  {/* Tooltip — only show when logged out (icon state) */}
                  {!user && (
                    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-0.5 z-[50] whitespace-nowrap rounded-full bg-black/95 px-3 py-1.5 text-[10px] font-medium tracking-[0.08em] text-white opacity-0 shadow-lg transition-all duration-200 -translate-y-1 group-hover:translate-y-0 group-hover:opacity-100">
                      Sign In
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-black/95" />
                    </span>
                  )}
                  {user && (
                    <>
                      <span className="text-xs font-semibold text-gray-900 hidden lg:block">
                        {user.firstName}
                      </span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
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

        {/* ── NAV BAR — black & white, Sabyasachi style ── */}
        <motion.nav
          ref={navRef}
          initial={false}
          animate={{
            height: showNav ? 40 : 0,
            opacity: showNav ? 1 : 0,
          }}
          transition={{
            height: {
              duration: 0.18,
              ease: [0.22, 1, 0.36, 1],
            },
            opacity: {
              duration: 0.12,
            },
          }}
          style={{
            willChange: "opacity",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          className="hidden md:block relative bg-white z-40"
        >
          <div className="overflow-hidden border-b border-gray-200">
            <ul className="flex justify-center items-center gap-0 h-10">
              {loading ? (
                [80, 100, 72, 88, 96, 76].map((w, i) => (
                  <li key={i} className="px-5">
                    <div
                      className="h-2.5 rounded-full bg-gray-100 animate-pulse"
                      style={{ width: `${w}px` }}
                    />
                  </li>
                ))
              ) : categories.length === 0 ? (
                <li className="text-xs text-gray-400">
                  No categories available
                </li>
              ) : (
                categories.map((category, index) => {
                  return (
                    <Fragment key={category.id}>
                      <li
                        onMouseEnter={() => {
                          if (hoverTimeoutRef.current)
                            clearTimeout(hoverTimeoutRef.current);
                          setHoveredCategory(category.id);
                          if (navRef.current)
                            setNavBottom(
                              navRef.current.getBoundingClientRect().bottom,
                            );
                        }}
                        onMouseLeave={() => {
                          hoverTimeoutRef.current = setTimeout(
                            () => setHoveredCategory(null),
                            80,
                          );
                        }}
                        className="relative h-full flex items-center"
                      >
                        <Link
                          href={getCategoryUrl(category.slug)}
                          className={`relative flex items-center gap-1 px-5 h-10 text-[12px] font-medium tracking-[0.12em] uppercase transition-colors duration-150 ${
                            hoveredCategory === category.id
                              ? "text-black"
                              : "text-gray-500 hover:text-black"
                          }`}
                        >
                          {category.name}
                          {category.children &&
                            category.children.length > 0 && (
                              <ChevronDown
                                className={`w-2.5 h-2.5 transition-transform duration-200 ${hoveredCategory === category.id ? "rotate-180" : ""}`}
                              />
                            )}
                        </Link>
                        {/* Active underline */}
                        {hoveredCategory === category.id && (
                          <motion.div
                            layoutId="navUnderline"
                            className="absolute bottom-0 left-5 right-5 h-[1.5px] bg-black"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 40,
                            }}
                          />
                        )}
                      </li>

                      {/* Dot separator */}
                      {index < categories.length - 1 && (
                        <li
                          key={`sep-${index}`}
                          aria-hidden="true"
                          className="flex items-center"
                        >
                          <span className="block w-[3px] h-[3px] rounded-full bg-gray-300" />
                        </li>
                      )}
                    </Fragment>
                  );
                })
              )}
            </ul>
          </div>

          {/* ── SABYASACHI-STYLE MEGAMENU ── */}
          <AnimatePresence>
            {hoveredCategory && activeCategory && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 right-0 top-full h-screen z-40 bg-black/30"
                  // style={{ top: navBottom }}
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current)
                      clearTimeout(hoverTimeoutRef.current);
                    setHoveredCategory(null);
                  }}
                  onClick={() => setHoveredCategory(null)}
                />

                {/* Full-width dropdown panel */}
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute left-0 right-0 top-full z-50 bg-white border-t border-gray-200 shadow-xl"
                  // style={{ top: navBottom }}
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current)
                      clearTimeout(hoverTimeoutRef.current);
                  }}
                  onMouseLeave={() => {
                    hoverTimeoutRef.current = setTimeout(
                      () => setHoveredCategory(null),
                      80,
                    );
                  }}
                >
                  <div className="max-w-screen-2xl mx-auto flex min-h-[420px] max-h-[420px]">
                    {" "}
                    {activeCategory.children &&
                    activeCategory.children.length > 0 ? (
                      /* ── CASE A: HAS CHILDREN (e.g. "What's New") ── */
                      <>
                        {/* Left sidebar */}
                        <div
                          className={`border-r border-gray-100 min-h-full py-10 transition-all duration-300 transition-all duration-300 ${
                            shouldUseGrid
                              ? "flex-1 pl-8 pr-16"
                              : "w-64 flex-shrink-0 px-8"
                          }`}
                        >
                          {" "}
                          <div
                            className={`gap-10 ${
                              shouldUseGrid
                                ? "flex flex-row items-start"
                                : "flex flex-col items-start"
                            }`}
                          >
                            {activeCategory.children.map((sub, idx) => (
                              <motion.div
                                key={sub.id}
                                className="min-w-[220px] flex-shrink-0"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.12,
                                  delay: idx * 0.03,
                                }}
                              >
                                <Link
                                  href={getCategoryUrl(sub.slug)}
                                  onClick={() => setHoveredCategory(null)}
                                  className="group flex items-center gap-3 text-base font-semibold tracking-wide text-gray-800 hover:text-black transition-colors duration-150 mb-2"
                                >
                                  <span className="block w-0 group-hover:w-4 h-[1.5px] bg-black transition-all duration-200 ease-out flex-shrink-0" />
                                  {sub.name}
                                </Link>
                                {sub.children && sub.children.length > 0 && (
                                  <div className="flex flex-col gap-3 ml-2 pl-4 border-l border-gray-100">
                                    {" "}
                                    {sub.children.map((grandchild, gIdx) => (
                                      <motion.div
                                        key={grandchild.id}
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                          duration: 0.1,
                                          delay: gIdx * 0.02,
                                        }}
                                      >
                                        <Link
                                          href={getCategoryUrl(grandchild.slug)}
                                          onClick={() =>
                                            setHoveredCategory(null)
                                          }
                                          className="text-sm text-gray-500 hover:text-black transition-colors duration-150 whitespace-nowrap"
                                        >
                                          {grandchild.name}
                                        </Link>
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                          <div className="mt-8 pt-5 border-t border-gray-200">
                            <Link
                              href={getCategoryUrl(activeCategory.slug)}
                              onClick={() => setHoveredCategory(null)}
                              className="text-xs font-bold text-black uppercase tracking-[0.15em] hover:underline underline-offset-4"
                            >
                              View All →
                            </Link>
                          </div>
                        </div>

                        {/* Right — image cards (only subcategories that have an image) */}
                        <div className="flex-1 h-[420px] py-10 px-10 overflow-hidden flex items-start">
                          {(() => {
                            const withImages = activeCategory.children.filter(
                              (sub) => sub.image,
                            );
                            return withImages.length > 0 ? (
                              <div className="flex flex-row items-start gap-10">
                                {withImages.map((sub, idx) => (
                                  <motion.div
                                    key={sub.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                      duration: 0.15,
                                      delay: idx * 0.04,
                                    }}
                                    className="flex flex-col items-start gap-3"
                                  >
                                    <div className="relative w-[180px] h-[240px] overflow-hidden bg-[#f8f8f8] flex-shrink-0">
                                      <Image
                                        src={sub.image!}
                                        alt={sub.name}
                                        fill
                                        className="object-cover object-top"
                                      />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-800 tracking-wide uppercase">
                                      {sub.name}
                                    </span>
                                  </motion.div>
                                ))}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </>
                    ) : (
                      /* ── CASE B: NO CHILDREN — clean editorial 2-column (e.g. "Weddings") ── */
                      <motion.div
                        className="flex w-full h-[420px] overflow-hidden items-start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.18 }}
                      >
                        {/* Left — category image, full height */}
                        {activeCategory.image && (
                          <div className="relative w-56 h-68 mt-1 flex-shrink-0 overflow-hidden">
                            {" "}
                            <Image
                              src={activeCategory.image}
                              alt={activeCategory.name}
                              fill
                              className="object-cover object-center"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
                          </div>
                        )}

                        {/* Right — title, clipped description, CTA */}
                        <div className="flex flex-col justify-center px-12 py-10">
                          <span className="block w-7 h-[1.5px] bg-[#c4a882] mb-5" />

                          <h3 className="font-serif text-2xl font-light tracking-[0.22em] uppercase text-gray-900 mb-3">
                            {activeCategory.name}
                          </h3>

                          {activeCategory.description && (
                            <p className="text-[13px] text-gray-500 leading-[1.85] line-clamp-3 max-w-sm">
                              {activeCategory.description}
                            </p>
                          )}

                          <Link
                            href={getCategoryUrl(activeCategory.slug)}
                            onClick={() => setHoveredCategory(null)}
                            className="inline-flex items-center gap-2 mt-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-black group w-fit"
                          >
                            <span className="border-b border-transparent group-hover:border-black transition-all duration-200">
                              Explore Collection
                            </span>
                            <span className="transition-transform duration-200 group-hover:translate-x-1">
                              →
                            </span>
                          </Link>
                        </div>
                      </motion.div>
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
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="md:hidden sticky top-0 z-40 bg-white shadow-md"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>

          <Link href="/">
            <motion.img
              src="/image-removebg-preview.png"
              alt="Kankana Silks"
              layoutId="mobile-logo"
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 18,
                mass: 0.6,
              }}
              className="h-9 w-auto object-contain block md:hidden"
            />
          </Link>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSearchOpen(true)}
            className="p-2"
          >
            <Search className="w-5 h-5" />
          </motion.button>
        </div>

        <div
          className={`px-4 py-2 border-t border-gray-100${isProductDetailPage || isCategoryPage ? " hidden" : ""}`}
        >
          {" "}
          <button
            onClick={() => setLocationModalOpen(true)}
            className="flex items-center gap-2 text-sm"
          >
            <MapPin className="w-4 h-4 text-gray-600" />
            <div className="flex flex-col items-start">
              <span className="text-xs text-gray-500">Deliver to</span>
              <span className="font-semibold text-gray-800">
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
                e.stopPropagation(); // ✅ ADD THIS
                setLocationModalOpen(false);
              }}
            />
            <motion.div
              ref={mobileLocationRef}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              // className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto z-20"
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
                          {/* Main Category */}
                          <div className="flex items-center">
                            {(category.children?.length ?? 0) > 0 && (
                              <button
                                onClick={() =>
                                  setActiveNav(isOpen ? "" : category.name)
                                }
                                className="flex h-12 w-10 shrink-0 items-center justify-center"
                              >
                                <span className="relative h-4 w-4">
                                  {/* Horizontal */}
                                  <span className="absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 bg-black" />

                                  {/* Vertical */}
                                  {!isOpen && (
                                    <span className="absolute left-1/2 top-0 h-4 w-[1.5px] -translate-x-1/2 bg-black" />
                                  )}
                                </span>
                              </button>
                            )}

                            <Link
                              href={getCategoryUrl(category.slug)}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex-1 py-4 text-[15px] font-medium uppercase tracking-[0.08em] text-black"
                            >
                              {category.name}
                            </Link>
                          </div>

                          {/* Children */}
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
                                          {/* Sub Category */}
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
                                                  {/* Horizontal */}
                                                  <span className="absolute left-0 top-1/2 h-[1.5px] w-3 -translate-y-1/2 bg-black" />

                                                  {/* Vertical */}
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

                                          {/* Grandchildren */}
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

                                  {/* View All */}
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
