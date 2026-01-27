"use client";
import { useEffect, useRef, useState } from "react";
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
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const openModal = useAuthModal((state) => state.openModal);
  const [showNav, setShowNav] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
  const pathname = usePathname();

  const { user } = useAuthModal();
  useOnClickOutside(userMenuRef, () => setUserMenuOpen(false));
  useOnClickOutside(locationRef, () => setLocationModalOpen(false));

  // Check if we're on my-account page
  const isMyAccountPage = pathname?.startsWith("/my-account");

  /* -------------------- CART API QUERY -------------------- */
  const { data: cartData, isLoading: isLoadingCartApi } = useQuery({
    queryKey: ["cartApi", user?.id],
    queryFn: async () => {
      const res = await cartApi.getCart();
      return res.data;
    },
    enabled: !!user,
    staleTime: 0,
  });

  /* -------------------- WISHLIST API QUERY -------------------- */
  const { data: wishlistData, isLoading: isLoadingWishlist } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      const res = await wishlistApi.getWishlist();
      return res.data;
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  /* -------------------- CALCULATE COUNTS -------------------- */
  // Cart count: Use API data if logged in, otherwise use local cart
  const apiCartItems = cartData?.items ?? [];
  const cartItemsCount = user ? apiCartItems.length : localCartItemsCount;

  // Wishlist count: Use API data if logged in, otherwise show 0
  const wishlistCount = user ? (wishlistData?.totalItems ?? 0) : 0;

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

        setLocation({
          ...parsed,
          city: parsed.city?.trim() || "Your Area",
        });
      }
    }
  }, [user, defaultAddress]);

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

    const locationData = {
      city: "Your Area",
      pincode,
      isServiceable,
    };

    setLocation(locationData);
    localStorage.setItem("userLocation", JSON.stringify(locationData));
    setPincode("");

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
            {
              headers: {
                "User-Agent": "KankanaSilks/1.0",
              },
            },
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
          console.error("Error getting location details:", error);
          toast.error("Failed to get location details");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        console.error("Geolocation error:", error);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location access denied. Please enable location.");
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
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  /* -------------------- FETCH CATEGORIES -------------------- */
  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: async () => {
      return await categoryService.getCategoryTree();
    },
    staleTime: 1000 * 60 * 10,
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
      console.log("error", error);
      toast.error("Logout failed", 1000);
    }
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
      name: "Consultation",
      icon: Video,
      type: "action",
      requiresAuth: false,
      onClick: () => {
        if (!user?.email) {
          setIsModalOpen(!isModalOpen);
        }
      },
    },
    {
      name: "Whatsapp",
      icon: MessageCircle,
      type: "action",
      requiresAuth: false,
      onClick: () => {
        window.open("https://wa.me/91XXXXXXXXXX", "_blank");
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

  return (
    <>
      {/* Desktop Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden md:block sticky top-0 z-50 shadow-sm"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-8 py-4 bg-white shadow-background">
          {/* Left Section - Logo + Location */}
          <div className="flex items-center gap-6 flex-1">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/">
                <Image
                  src="/image-removebg-preview.png"
                  alt="Kankana Silks"
                  width={200}
                  height={200}
                  priority
                  className={`transition-all duration-300 ${
                    showNav ? "lg:h-10" : "lg:h-14"
                  } w-auto object-contain`}
                />
              </Link>
            </motion.div>

            {/* Location Display */}
            <div className="relative">
              <button
                onClick={() => setLocationModalOpen((p) => !p)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <MapPin className="w-4 h-4" />
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500">Deliver to</span>
                  <span className="font-semibold">
                    {location
                      ? `${location.city || "Your Area"} - ${location.pincode}`
                      : "Select Location"}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    locationModalOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* Location Modal - Desktop */}
              <AnimatePresence>
                {locationModalOpen && (
                  <motion.div
                    ref={locationRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-3 w-96 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100"
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                          Choose your location
                        </h3>
                        <button
                          onClick={() => setLocationModalOpen(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* User's Saved Addresses (if logged in) */}
                      {user && addresses.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">
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
                                className="w-full text-left p-3 border-2 border-gray-200 rounded-lg hover:border-black transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-sm text-gray-900">
                                      {address.fullName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {address.city} - {address.pincode}
                                    </p>
                                  </div>
                                  {address.isDefault && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
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
                            className="block mt-3 text-sm text-blue-600 font-medium text-center py-2"
                          >
                            Manage addresses
                          </Link>
                          <div className="border-t border-gray-200 my-4" />
                        </div>
                      )}

                      {/* Pincode Input */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          {user && addresses.length > 0
                            ? "Or enter a different pincode"
                            : "Enter your pincode"}
                        </h4>
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            placeholder="Enter 6-digit Pincode"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            maxLength={6}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") handlePincodeSubmit();
                            }}
                          />
                          <button
                            onClick={handlePincodeSubmit}
                            disabled={isCheckingPincode || pincode.length !== 6}
                            className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                          >
                            {isCheckingPincode ? "..." : "Check"}
                          </button>
                        </div>

                        <button
                          onClick={handleUseCurrentLocation}
                          disabled={isGettingLocation}
                          className="w-full mb-4 py-2.5 border-2 border-gray-300 rounded-lg hover:border-black transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:text-black disabled:opacity-50"
                        >
                          <MapPin className="w-4 h-4" />
                          {isGettingLocation
                            ? "Getting location..."
                            : "Use my current location"}
                        </button>

                        {location && location.isServiceable !== undefined && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className={`p-4 rounded-lg border-2 ${
                              location.isServiceable
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {location.isServiceable ? (
                                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                                  <X className="w-5 h-5 text-white" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p
                                  className={`font-bold text-sm mb-1 ${
                                    location.isServiceable
                                      ? "text-green-900"
                                      : "text-red-900"
                                  }`}
                                >
                                  {location.isServiceable
                                    ? "Delivery Available!"
                                    : "Not Serviceable"}
                                </p>
                                <p className="text-xs text-gray-700">
                                  Pincode: {location.pincode}
                                </p>
                              </div>
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
                          className="w-full mt-4 py-3 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Sign in to see your addresses
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Center - Search Bar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 max-w-xl mx-8"
          >
            <button onClick={() => setIsSearchOpen(true)} className="w-full">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search for products, categories..."
                  className="w-full px-4 py-2 pl-10 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-300 cursor-pointer"
                  readOnly
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
              </div>
            </button>
          </motion.div>

          {/* Right - Icons */}
          <div className="flex items-center gap-6">
            {icons.map((item) => {
              const Icon = item.icon;

              const Button = (
                <motion.button
                  whileHover={{ scale: 0.9 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => {
                    if (item.requiresAuth) {
                      authGuard(item.onClick);
                    } else {
                      item.onClick?.();
                    }
                  }}
                  className="relative text-gray-600 hover:text-black"
                >
                  <Icon className="w-5 h-5" />

                  {"badgeCount" in item && item.badgeCount! > 0 && (
                    <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badgeCount}
                    </span>
                  )}
                </motion.button>
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
                    {Button}
                  </Link>
                );
              }

              return <div key={item.name}>{Button}</div>;
            })}

            {/* User Menu Icon */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 0.9 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => {
                  if (!user) {
                    openModal("login");
                  } else {
                    setUserMenuOpen((p) => !p);
                  }
                }}
                className="relative inline-flex gap-2 items-center text-gray-600 hover:text-black"
              >
                {!user && <User className="w-5 h-5" />}
                {user && (
                  <p className="text-sm font-semibold text-gray-900">
                    Hello, {user.firstName}!
                  </p>
                )}
              </motion.button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {user && userMenuOpen && (
                  <motion.div
                    ref={userMenuRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      href="/my-account"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                    >
                      My Account
                    </Link>
                    <Link
                      href="/my-account/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/my-account/addresses"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                    >
                      Addresses
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <motion.nav
          initial={{ y: 0, opacity: 1 }}
          animate={{
            y: showNav ? 0 : -80,
            opacity: showNav ? 1 : 0,
            display: showNav ? "block" : "none",
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="hidden md:block relative bg-white border-t border-gray-100"
        >
          <motion.ul
            initial={{ y: -20, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center items-center gap-8 py-4 px-8"
          >
            {loading ? (
              <li className="text-xs text-gray-400 animate-pulse">
                Loading categories...
              </li>
            ) : categories.length === 0 ? (
              <li className="text-xs text-gray-400">No categories available</li>
            ) : (
              categories.map((category, index) => (
                <motion.li
                  key={category.id}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                  onHoverStart={() => setActiveNav(category.name)}
                  onHoverEnd={() => setActiveNav("")}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="relative cursor-pointer group"
                >
                  <Link
                    href={getCategoryUrl(category.slug)}
                    className="flex items-center gap-1"
                  >
                    <span className="text-xs font-bold tracking-wider transition-all duration-300 hover:text-gray-900">
                      {category.name}
                    </span>
                    {category.children && category.children.length > 0 && (
                      <ChevronDown
                        className={`w-3 h-3 transition-all duration-300 ${
                          hoveredCategory === category.id
                            ? "rotate-180 text-black"
                            : "text-gray-500"
                        }`}
                      />
                    )}
                  </Link>

                  {activeNav === category.name && (
                    <motion.div
                      layoutId="activeDesktopNav"
                      className="absolute -bottom-4 left-0 right-0 h-0.5 bg-black"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.li>
              ))
            )}
          </motion.ul>

          {/* Dropdown Megamenu */}
          <AnimatePresence>
            {hoveredCategory && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100 z-50"
              >
                <div className="max-w-7xl mx-auto px-8 py-8">
                  <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-7">
                      <div className="grid grid-cols-2 gap-6">
                        {categories
                          .find((cat) => cat.id === hoveredCategory)
                          ?.children?.map((subCategory, idx) => (
                            <motion.div
                              key={subCategory.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: idx * 0.05,
                              }}
                              whileHover={{ x: 5 }}
                              className="group cursor-pointer"
                            >
                              <Link
                                href={getCategoryUrl(subCategory.slug)}
                                className="flex items-center gap-2"
                              >
                                <p className="text-sm font-medium text-gray-800 group-hover:text-black transition-colors duration-300">
                                  {subCategory.name}
                                </p>
                              </Link>
                              <div className="h-px bg-gradient-to-r from-gray-300 to-transparent w-0 group-hover:w-full transition-all duration-500 mt-2" />
                            </motion.div>
                          ))}
                      </div>
                    </div>

                    <div className="col-span-5 border-l border-gray-100 pl-8">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-4"
                      >
                        {categories.find((cat) => cat.id === hoveredCategory)
                          ?.image && (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden shadow-md">
                            <Image
                              src={
                                categories.find(
                                  (cat) => cat.id === hoveredCategory,
                                )?.image || ""
                              }
                              alt={
                                categories.find(
                                  (cat) => cat.id === hoveredCategory,
                                )?.name || ""
                              }
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {
                              categories.find(
                                (cat) => cat.id === hoveredCategory,
                              )?.name
                            }
                          </h3>
                          {categories.find((cat) => cat.id === hoveredCategory)
                            ?.description && (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {
                                categories.find(
                                  (cat) => cat.id === hoveredCategory,
                                )?.description
                              }
                            </p>
                          )}
                          <Link
                            href={getCategoryUrl(
                              categories.find(
                                (cat) => cat.id === hoveredCategory,
                              )?.slug || "",
                            )}
                            className="inline-block mt-4 text-sm font-medium text-black hover:underline"
                          >
                            View All →
                          </Link>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
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
            <img
              src="/image-removebg-preview.png"
              className="h-10 w-auto"
              alt="kankana_silks"
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

        {/* Location Bar Mobile */}
        <div className="px-4 py-2 border-t border-gray-100">
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
              className="absolute inset-0 bg-black/50"
              onClick={() => setLocationModalOpen(false)}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
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

                {/* User's Saved Addresses */}
                {user && addresses.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Your Addresses
                    </h4>
                    <div className="space-y-3">
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
                          className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-black transition-colors"
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
                            {address.isDefault && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
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
                      className="block mt-3 text-sm text-blue-600 font-medium text-center py-2"
                    >
                      Manage addresses
                    </Link>
                    <div className="border-t border-gray-200 my-4" />
                  </div>
                )}

                {/* Pincode Input */}
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
                      onClick={handlePincodeSubmit}
                      disabled={isCheckingPincode || pincode.length !== 6}
                      className="px-5 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50"
                    >
                      {isCheckingPincode ? "..." : "Check"}
                    </button>
                  </div>

                  <button
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
                      className={`p-4 rounded-xl border-2 ${
                        location.isServiceable
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {location.isServiceable ? (
                          <Check className="w-6 h-6 text-green-600" />
                        ) : (
                          <X className="w-6 h-6 text-red-600" />
                        )}
                        <div>
                          <p
                            className={`font-bold ${
                              location.isServiceable
                                ? "text-green-900"
                                : "text-red-900"
                            }`}
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
                    onClick={() => {
                      setLocationModalOpen(false);
                      openModal("login");
                    }}
                    className="w-full mt-6 py-3 text-blue-600 font-semibold border-2 border-blue-200 rounded-xl hover:bg-blue-50"
                  >
                    Sign in to see your addresses
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

                {/* User Info if logged in */}
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
                        Addresses
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

                {/* Categories */}
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="border-b pb-4">
                      <div className="flex items-center justify-between">
                        <Link
                          href={getCategoryUrl(category.slug)}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex-1 font-medium"
                        >
                          {category.name}
                        </Link>
                        {category.children && category.children.length > 0 && (
                          <button
                            onClick={() =>
                              setActiveNav(
                                activeNav === category.name
                                  ? ""
                                  : category.name,
                              )
                            }
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                activeNav === category.name ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {activeNav === category.name && category.children && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-2 pl-4 space-y-2"
                          >
                            {category.children.map((sub) => (
                              <Link
                                key={sub.id}
                                href={getCategoryUrl(sub.slug)}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm text-gray-600 py-1"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {!isMyAccountPage && (
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] border-t"
        >
          <ul className="flex justify-around items-center py-3">
            {icons.map((item, index) => {
              const IconComponent = item.icon;
              const isActive =
                pathname === item.url || pathname?.startsWith(item.url + "/");

              return (
                <li key={index} className="relative">
                  {item.type === "link" ? (
                    <Link
                      href={item.url!}
                      onClick={(e) => {
                        if (item.requiresAuth && !user) {
                          e.preventDefault();
                          openModal("login");
                        }
                      }}
                      className="flex flex-col items-center gap-1 p-2"
                    >
                      <IconComponent
                        className={`w-5 h-5 ${
                          isActive ? "text-black" : "text-gray-600"
                        }`}
                      />
                      <span
                        className={`text-[10px] font-medium ${
                          isActive ? "text-black" : "text-gray-600"
                        }`}
                      >
                        {item.name}
                      </span>
                      {"badgeCount" in item && item.badgeCount! > 0 && (
                        <span className="absolute top-0 right-0 bg-black text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                          {item.badgeCount}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <button
                      onClick={() => item.onClick?.()}
                      className="flex flex-col items-center gap-1 p-2"
                    >
                      <IconComponent className="w-5 h-5 text-gray-600" />
                      <span className="text-[10px] text-gray-600">
                        {item.name}
                      </span>
                    </button>
                  )}
                </li>
              );
            })}

            {/* User Icon in Mobile Bottom Nav */}
            <li className="relative">
              <button
                onClick={() => {
                  if (!user) {
                    openModal("login");
                  } else {
                    window.location.href = "/my-account";
                  }
                }}
                className="flex flex-col items-center gap-1 p-2"
              >
                <User
                  className={`w-5 h-5 ${
                    pathname?.startsWith("/my-account")
                      ? "text-black"
                      : "text-gray-600"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium ${
                    pathname?.startsWith("/my-account")
                      ? "text-black"
                      : "text-gray-600"
                  }`}
                >
                  {user ? "Account" : "Login"}
                </span>
              </button>
            </li>
          </ul>
        </motion.nav>
      )}

      {/* Unified Search Modal */}
      <UnifiedSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Video Consultation Modal */}
      <VideoConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default Header;
