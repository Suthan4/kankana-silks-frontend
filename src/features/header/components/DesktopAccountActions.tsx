"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown, MessageCircle, Search, User } from "lucide-react";
import { useOnClickOutside } from "@/hooks/useClickOutside";
import type { User as AuthUser } from "@/store/useAuthModalStore";
import type { HeaderQuickLink } from "./MobileBottomNavigation";

interface Props {
  items: HeaderQuickLink[];
  user: AuthUser | null;
  isHeaderWhite: boolean;
  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
  openSearch: () => void;
  openLogin: () => void;
  onLogout: () => void;
}

export function DesktopAccountActions({
  items, user, isHeaderWhite, userMenuOpen, setUserMenuOpen,
  openSearch, openLogin, onLogout,
}: Props) {
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(userMenuRef, () => setUserMenuOpen(false));

  return (
    <div className="flex flex-shrink-0 items-center justify-end gap-4">
      <button type="button" onClick={openSearch} className={`flex min-w-[160px] items-center gap-2 rounded-full border px-4 py-2 text-sm transition-[background-color,border-color,color] duration-200 ${isHeaderWhite ? "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-400 hover:bg-white hover:text-gray-700" : "border-white/50 bg-black/10 text-white hover:border-white hover:bg-white/10"}`}>
        <Search className="h-4 w-4 flex-shrink-0" /><span>Search…</span>
      </button>
      <div className="flex h-full items-center justify-center gap-3">
        {items.filter((item) => ["Cart", "Wishlist"].includes(item.name)).map((item) => {
          const Icon = item.icon;
          const button = (
            <div className="group relative">
              <motion.button type="button" whileHover={{ scale: 0.92 }} whileTap={{ scale: 0.86 }} onClick={() => { if (item.requiresAuth && !user) openLogin(); else item.onClick?.(); }} aria-label={item.badgeCount && item.badgeCount > 0 ? `${item.name}, ${item.badgeCount} items` : item.name} className={`relative flex h-10 w-10 items-center justify-center transition-colors duration-300 ${isHeaderWhite ? "text-gray-700 hover:text-black" : "text-white"}`}>
                <Icon style={{ width: "20px", height: "20px" }} />
                {!!item.badgeCount && item.badgeCount > 0 && <span className="absolute -right-[0.1rem] -top-[0.1rem] flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">{item.badgeCount}</span>}
              </motion.button>
              <span className="pointer-events-none absolute left-1/2 top-full z-[50] mt-0.5 -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded-full bg-black/95 px-3 py-1.5 text-[10px] font-medium tracking-[0.08em] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">{item.name}</span>
            </div>
          );
          return item.type === "link" ? (
            <Link key={item.name} href={item.url!} onClick={(event) => { if (item.requiresAuth && !user) { event.preventDefault(); openLogin(); } }}>
              {button}
            </Link>
          ) : <div key={item.name}>{button}</div>;
        })}

        <div className="group relative">
          <motion.button type="button" whileHover={{ scale: 0.92 }} whileTap={{ scale: 0.86 }} onClick={() => window.open("https://api.whatsapp.com/send?phone=916364945568&text=Hello%20Kankana%20Silks,%20I%E2%80%99m%20interested%20in%20exploring%20your%20saree%20collection.", "_blank")} aria-label="Chat with us on WhatsApp" className={`flex h-10 w-10 items-center justify-center transition-colors duration-300 ${isHeaderWhite ? "text-gray-700 hover:text-black" : "text-white"}`}>
            <MessageCircle style={{ width: "20px", height: "20px" }} />
          </motion.button>
          <span className="pointer-events-none absolute left-1/2 top-full z-[50] mt-0.5 -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded-full bg-black/95 px-3 py-1.5 text-[10px] font-medium tracking-[0.08em] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            Connect on WhatsApp
            <span className="absolute bottom-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-black/95" />
          </span>
        </div>

        <div ref={userMenuRef} className="group relative" onMouseEnter={() => user && setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
          <button type="button" onClick={() => { if (!user) openLogin(); else setUserMenuOpen((previous) => !previous); }} aria-label={user ? "Open account menu" : "Sign in"} className={`flex h-10 items-center justify-center gap-1 px-1 transition-colors duration-300 ${isHeaderWhite ? "text-gray-700 hover:text-black" : "text-white"}`}>
            {!user && (
              <>
                <User style={{ width: "20px", height: "20px" }} />
                <span className="pointer-events-none absolute left-1/2 top-full z-[50] mt-0.5 -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded-full bg-black/95 px-3 py-1.5 text-[10px] font-medium tracking-[0.08em] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  Sign In
                  <span className="absolute bottom-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-black/95" />
                </span>
              </>
            )}
            {user && <><span className={`hidden text-sm font-semibold lg:block ${isHeaderWhite ? "text-gray-900" : "text-white"}`}>{user.firstName}</span><ChevronDown className="h-3.5 w-3.5 text-gray-400" /></>}
          </button>
          <AnimatePresence>
            {user && userMenuOpen && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl">
                <div className="border-b border-gray-100 px-4 py-3"><p className="text-xs font-semibold text-gray-900">{user.firstName}</p><p className="truncate text-[10px] text-gray-600">{user.email}</p></div>
                {[
                  ["My Account", "/my-account"],
                  ["My Orders", "/my-account/orders"],
                  ["Addresses", "/my-account/addresses"],
                ].map(([label, href]) => <Link key={href} href={href} onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-xs text-gray-700 transition-colors hover:bg-gray-50 hover:text-black">{label}</Link>)}
                <button onClick={() => { setUserMenuOpen(false); onLogout(); }} className="w-full border-t border-gray-100 px-4 py-2.5 text-left text-xs text-red-600 transition-colors hover:bg-red-50">Sign Out</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
