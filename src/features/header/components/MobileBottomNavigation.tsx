"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import type { User as AuthUser } from "@/store/useAuthModalStore";
import type { LucideIcon } from "lucide-react";

export interface HeaderQuickLink {
  name: string;
  icon: LucideIcon;
  type: "link" | "action";
  url?: string;
  requiresAuth?: boolean;
  badgeCount?: number;
  onClick?: () => void;
}

interface MobileBottomNavigationProps {
  items: HeaderQuickLink[];
  user: AuthUser | null;
  pathname: string | null;
  isMyAccountPage: boolean;
  isProductDetailPage: boolean;
  isCategoryPage: boolean;
  onAccountClick: () => void;
  openLogin: () => void;
}

export function MobileBottomNavigation({
  items,
  user,
  pathname,
  isMyAccountPage,
  isProductDetailPage,
  isCategoryPage,
  onAccountClick,
  openLogin,
}: MobileBottomNavigationProps) {
  if (isMyAccountPage || isProductDetailPage || isCategoryPage) return null;

  const visibleItems = user
    ? ["Home", "Cart", "Wishlist"]
    : ["Home", "Consultation", "Cart", "Wishlist"];

  return (
    <motion.nav
      aria-label="Quick links"
      initial={false}
      className="fixed bottom-0 left-0 right-0 z-50 h-[calc(76px+env(safe-area-inset-bottom))] border-t border-[#EADFDB] bg-white pb-[env(safe-area-inset-bottom)] shadow-none md:hidden"
    >
      <ul className="flex h-[76px] items-start justify-around pt-2 pb-1">
        {items.filter((item) => visibleItems.includes(item.name)).map((item, index) => {
          const Icon = item.icon;
          const isActive = item.url === "/"
            ? pathname === "/"
            : pathname === item.url || pathname?.startsWith(item.url + "/");

          return (
            <li key={index} className="relative flex-1">
              {item.type === "link" ? (
                <Link
                  href={item.url!}
                  onClick={(event) => {
                    if (item.requiresAuth && !user) {
                      event.preventDefault();
                      openLogin();
                    }
                  }}
                  className="relative flex min-h-11 flex-col items-center justify-center gap-1 py-1"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -top-3 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-brand-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-brand-primary" : "text-neutral-700"}`} />
                  <span className={`text-xs font-semibold transition-colors ${isActive ? "text-brand-primary" : "text-neutral-700"}`}>
                    {item.name}
                  </span>
                  {!!item.badgeCount && item.badgeCount > 0 && (
                    <span className="absolute right-1/4 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[8px] font-medium text-white">
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="flex min-h-11 w-full flex-col items-center justify-center gap-1 py-1"
                >
                  <Icon className="h-6 w-6 text-neutral-700" />
                  <span className="text-xs font-semibold text-neutral-800">{item.name}</span>
                </button>
              )}
            </li>
          );
        })}

        <li className="relative flex-1">
          <button
            type="button"
            onClick={onAccountClick}
            className="relative flex min-h-11 w-full flex-col items-center justify-center gap-1 py-2"
          >
            {pathname?.startsWith("/my-account") && (
              <motion.div
                layoutId="activeTab"
                className="absolute -top-3 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-brand-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <User className={`h-5 w-5 transition-colors ${pathname?.startsWith("/my-account") ? "text-brand-primary" : "text-neutral-700"}`} />
            <span className={`text-xs font-semibold transition-colors ${pathname?.startsWith("/my-account") ? "text-brand-primary" : "text-neutral-700"}`}>
              {user ? "Account" : "Login"}
            </span>
          </button>
        </li>
      </ul>
    </motion.nav>
  );
}
