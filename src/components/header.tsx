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
  Home,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { authModalStore, useAuthModal } from "@/store/useAuthModalStore";
import Link from "next/link";
import { useOnClickOutside } from "@/hooks/useClickOutside";
import clientApiService from "@/lib/api/api.client.service";
import categoryService, { Category } from "@/lib/api/category.api.service";
import { toast } from "@/store/useToastStore";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("");
  const [activeIcon, setActiveIcon] = useState("Home");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const openModal = useAuthModal((state) => state.openModal);
  const [showNav, setShowNav] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const { user } = useAuthModal();
  useOnClickOutside(ref, () => setUserMenuOpen(false));

  /* -------------------- FETCH CATEGORIES -------------------- */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryService.getCategoryTree();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load categories", 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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

  const handleLogout = async () => {
    try {
      await clientApiService.logout();
      authModalStore.logout();
    } catch (error) {
      console.log("error", error);
      toast.error("Invalid Token", 1000);
    }
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 20);

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

  const icons = [
    {
      name: "Home",
      icon: Home,
      type: "link",
      url: "/",
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
                    />
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
                    href={`/category/${category.slug}`}
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

                  {/* Underline Animation */}
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
                className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100"
              >
                <div className="max-w-7xl mx-auto px-8 py-8">
                  <div className="grid grid-cols-12 gap-8">
                    {/* Left Side - Subcategories List */}
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
                                href={`/category/${subCategory.slug}`}
                                className="flex items-center gap-2"
                              >
                                {/* <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" /> */}
                                <p className="text-sm font-medium text-gray-800 group-hover:text-black transition-colors duration-300">
                                  {subCategory.name}
                                </p>
                              </Link>
                              <div className="h-px bg-gradient-to-r from-gray-300 to-transparent w-0 group-hover:w-full transition-all duration-500 mt-2 ml-6" />
                            </motion.div>
                          ))}
                      </div>
                    </div>

                    {/* Right Side - Parent Category with Image */}
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
                                  (cat) => cat.id === hoveredCategory
                                )?.image || ""
                              }
                              alt={
                                categories.find(
                                  (cat) => cat.id === hoveredCategory
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
                                (cat) => cat.id === hoveredCategory
                              )?.name
                            }
                          </h3>
                          {categories.find((cat) => cat.id === hoveredCategory)
                            ?.description && (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {
                                categories.find(
                                  (cat) => cat.id === hoveredCategory
                                )?.description
                              }
                            </p>
                          )}
                          <Link
                            href={`/category/${
                              categories.find(
                                (cat) => cat.id === hoveredCategory
                              )?.slug
                            }`}
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
        className="md:hidden sticky top-0 z-50 bg-white shadow-md"
      >
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

          <Link href="/">
            <img
              src="/image-removebg-preview.png"
              className="h-10 w-auto"
              alt="kankana_silks"
            />
          </Link>

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
            style={{ top: "64px" }}
          >
            <div className="px-4 py-6">
              {loading ? (
                <div className="text-center text-gray-400 py-4">
                  Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  No categories available
                </div>
              ) : (
                categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 pb-4 mb-4"
                  >
                    <button
                      onClick={() =>
                        setActiveNav(
                          activeNav === category.name ? "" : category.name
                        )
                      }
                      className="w-full flex items-center justify-between py-2"
                    >
                      <span className="text-sm font-medium tracking-wide">
                        {category.name}
                      </span>
                      {category.children && category.children.length > 0 && (
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${
                            activeNav === category.name ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>

                    <AnimatePresence>
                      {activeNav === category.name &&
                        category.children &&
                        category.children.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            {category.children.map((subCategory, idx) => (
                              <Link
                                key={subCategory.id}
                                href={`/category/${subCategory.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <motion.p
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="text-sm text-gray-600 py-2 pl-4 hover:text-black transition-colors cursor-pointer flex items-center gap-2"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                  {subCategory.name}
                                </motion.p>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
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
                  setActiveIcon(item.name);
                  if (item.type === "action") {
                    item.onClick?.();
                  }
                }}
                className="flex flex-col items-center gap-1 cursor-pointer p-2 relative"
              >
                {item.type === "link" ? (
                  <Link
                    href={item.url!}
                    onClick={(e) => {
                      if (item.requiresAuth && !user) {
                        e.preventDefault();
                        openModal("login");
                      }
                    }}
                    className="flex flex-col items-center gap-1"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeMobileIcon"
                        className="absolute -top-0 left-0 right-0 h-0.5 bg-black rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
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
                    {"badgeCount" in item && item.badgeCount! > 0 && (
                      <span className="absolute top-1 right-1 bg-black text-white text-[8px] rounded-full w-3 h-3 flex items-center justify-center font-medium">
                        {item.badgeCount}
                      </span>
                    )}
                  </Link>
                ) : (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeMobileIcon"
                        className="absolute -top-0 left-0 right-0 h-0.5 bg-black rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
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
                  </>
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
