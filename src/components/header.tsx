"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  MessageCircle,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Search,
  ChevronDown,
  Home,
} from "lucide-react";
import Tooltip from "./ui/Tooltip";
import Image from "next/image";
import { authModalStore, useAuthModal } from "@/store/useAuthModalStore";
import Link from "next/link";
import { useOnClickOutside } from "@/hooks/useClickOutside";
import { BaseApiService } from "@/lib/api/api.base.service";
import adminApiService from "@/lib/api/api.admin.service";
import clientApiService from "@/lib/api/api.client.service";
import { toast } from "@/store/useToastStore";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("WOMENSWEAR");
  const [activeIcon, setActiveIcon] = useState("Home");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const openModal = useAuthModal((state) => state.openModal);
  const [showNav, setShowNav] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement|null>(null);

  const { user } = useAuthModal();
  useOnClickOutside(ref, () => setUserMenuOpen(false));
  console.log("user", user);

  /* -------------------- HELPERS -------------------- */
  const getDisplayName = () => {
    if (!user?.firstName) return "";
    return user.firstName.length > 8
      ? user.firstName.slice(0, 8) + "…"
      : user.firstName;
  };

  const authGuard = (cb?: () => void) => {
    if (!user) {
      openModal("login");
      return;
    }
    cb?.();
  };

  const handleLogout = async() =>{
    try {
      await clientApiService.logout();
      authModalStore.logout();
    } catch (error) {
      console.log("error",error);
      toast.error("Invalid Token",1000)
    }
  }

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        // scrolling down
        setShowNav(false);
      } else {
        // scrolling up
        setShowNav(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    {
      title: "WHAT'S NEW",
      subcategories: [
        "New Arrivals",
        "Trending Sarees",
        "Just Launched",
        "Best Sellers",
        "Ready to Ship",
      ],
    },
    {
      title: "SAREES",
      subcategories: [
        "Silk Sarees",
        "Cotton Sarees",
        "Handloom Sarees",
        "Designer Sarees",
        "Festive Sarees",
      ],
    },
    {
      title: "HANDLOOM",
      subcategories: ["Kanjeevaram", "Banarasi", "Chanderi", "Tussar", "Linen"],
    },
    {
      title: "OCCASION",
      subcategories: [
        "Wedding Sarees",
        "Bridal Sarees",
        "Festive Wear",
        "Party Wear",
        "Daily Wear",
      ],
    },
    {
      title: "WEAVES & CRAFT",
      subcategories: [
        "Pure Silk",
        "Soft Silk",
        "Cotton Silk",
        "Organza",
        "Georgette",
      ],
    },
    {
      title: "SHOP BY PRICE",
      subcategories: [
        "Under ₹2,000",
        "Under ₹5,000",
        "Under ₹10,000",
        "Under ₹20,000",
        "Premium Collection",
      ],
    },
    {
      title: "COLLECTIONS",
      subcategories: [
        "Heritage Collection",
        "Contemporary Classics",
        "Minimal Elegance",
        "Luxury Edit",
      ],
    },
  ];

  const icons = [
    {
      name: "Home",
      icon: Home,
      type: "link",
      url: "/",
    },
    {
      name: "Whatsapp connect",
      icon: MessageCircle,
      type: "action",
      requiresAuth: true,
      onClick: () => {
        window.open("https://wa.me/91XXXXXXXXXX", "_blank");
      },
    },
    {
      name: "Cart",
      icon: ShoppingCart,
      type: "link",
      url: "/cart",
      requiresAuth: true,
      badgeCount: cartCount,
    },
    {
      name: "Wishlist",
      icon: Heart,
      type: "link",
      requiresAuth: true,
      url: "/wishlist",
      badgeCount: wishlistCount,
    },
  ];

  return (
    <>
      {/* Promotional Banner */}
      {/* <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 text-center py-2 px-4"
      >
        <p className="text-xs md:text-sm font-medium text-gray-800">
          ✨ GET 15% OFF YOUR FIRST PURCHASE 👋 USE CODE: WELCOME15
        </p>
      </motion.div> */}

      {/* Desktop Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden md:block sticky top-0 z-50 shadow-sm"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-8 py-4 bg-white shadow-background">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1"
          >
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
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 max-w-md mx-8"
          >
            <div className="relative group">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-2 pl-10 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-300"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
            </div>
          </motion.div>

          {/* Icons */}
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

                  {"badgeCount" in item && (
                    <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badgeCount ?? 0}
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

            {/* USER SECTION */}
            <div className="relative">
              {!user ? (
                <button onClick={() => openModal("login")}>
                  <User className="w-5 h-5 text-gray-600" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setUserMenuOpen((p) => !p)}
                    className="flex items-center gap-1 text-sm font-medium text-gray-800"
                  >
                    {getDisplayName()}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        userMenuOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />{" "}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        ref={ref}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        <Link
                          href="/account"
                          className="block px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          My Account
                        </Link>
                        <Link
                          href="/orders"
                          className="block px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
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
          className="hidden md:block relative bg-white"
        >
          <motion.ul
            initial={{ y: -20, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center items-center gap-8 py-4 px-8"
          >
            {navItems.map((item, index) => (
              <motion.li
                key={index}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                onHoverStart={() =>
                  setActiveNav(activeNav === item.title ? "" : item.title)
                }
                onHoverEnd={() => setActiveNav("")}
                onMouseEnter={() => setHoveredCategory(item.title)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => setActiveNav(item.title)}
                className="relative cursor-pointer group"
              >
                <div className="flex items-center gap-1">
                  <span
                    className={`text-xs font-bold tracking-wider transition-all duration-300`}
                  >
                    {item.title}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-all duration-300 ${
                      hoveredCategory === item.title
                        ? "rotate-180 text-black"
                        : "text-gray-500"
                    }`}
                  />
                </div>

                {/* Underline Animation */}
                {activeNav === item.title && (
                  <motion.div
                    layoutId="activeDesktopNav"
                    className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.li>
            ))}
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
                className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100"
              >
                <div className="max-w-7xl mx-auto px-8 py-8">
                  <div className="grid grid-cols-4 gap-8">
                    {navItems
                      .find((item) => item.title === hoveredCategory)
                      ?.subcategories.map((sub, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          whileHover={{ x: 5 }}
                          className="group cursor-pointer"
                        >
                          <p className="text-sm font-medium text-gray-800 group-hover:text-black transition-colors duration-300">
                            {sub}
                          </p>
                          <div className="h-px bg-gradient-to-r from-gray-300 to-transparent w-0 group-hover:w-full transition-all duration-500 mt-2" />
                        </motion.div>
                      ))}
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
        className="md:hidden sticky top-0 z-50 bg-white shadow-md"
      >
        {/* Promo Banner Mobile */}
        {/* <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 text-center py-2 px-4">
          <p className="text-[10px] font-medium text-gray-800">
            ✨ 15% OFF FIRST PURCHASE
          </p>
        </div> */}

        {/* Top Bar */}
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

          <img
            src="/image-removebg-preview.png"
            className="h-10 w-auto"
            alt="knakana_silks"
          />

          <motion.button whileTap={{ scale: 0.9 }} className="p-2">
            <Search className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 bg-white z-40 overflow-y-auto"
            style={{ top: "112px" }}
          >
            <div className="px-4 py-6">
              {navItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 pb-4 mb-4"
                >
                  <button
                    onClick={() =>
                      setActiveNav(activeNav === item.title ? "" : item.title)
                    }
                    className="w-full flex items-center justify-between py-2"
                  >
                    <span className="text-sm font-medium tracking-wide">
                      {item.title}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        activeNav === item.title ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {activeNav === item.title && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        {item.subcategories.map((sub, idx) => (
                          <motion.p
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="text-sm text-gray-600 py-2 pl-4 hover:text-black transition-colors cursor-pointer"
                          >
                            {sub}
                          </motion.p>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] border-t border-gray-100"
      >
        <ul className="flex justify-around items-center py-3">
          {icons.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = activeIcon === item.name;
            return (
              <motion.li
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.08 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => {
                  if (item.type === "modal") {
                    openModal("login"); // 🔥 open sign-in modal
                  }
                  if (item.type === "action") {
                    item.onClick?.();
                  }
                }}
                className="flex flex-col items-center gap-1 cursor-pointer p-2 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMobileIcon"
                    className="absolute -top-0 left-0 right-0 h-0.5 bg-black rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <IconComponent
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? "text-black" : "text-gray-600"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors duration-300 ${
                    isActive ? "text-black" : "text-gray-600"
                  }`}
                >
                  {item.name}
                </span>
                {item.name === "Cart" && (
                  <span className="absolute top-1 right-1 bg-black text-white text-[8px] rounded-full w-3 h-3 flex items-center justify-center font-medium">
                    2
                  </span>
                )}
              </motion.li>
            );
          })}
        </ul>
      </motion.nav>
    </>
  );
}

export default Header;
