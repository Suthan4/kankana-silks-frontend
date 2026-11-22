"use client";

import { useCallback, useMemo } from "react";
import { Heart, Home, MessageCircle, ShoppingCart, Video } from "lucide-react";
import { buildCategoryQuery } from "@/lib/shared/builders/productCategoryQuery.builder.ts";
import type { User } from "@/store/useAuthModalStore";
import type { HeaderQuickLink } from "@/features/header/components/MobileBottomNavigation";

interface Options {
  user: User | null;
  cartItemsCount: number;
  wishlistCount: number;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export function useHeaderNavigation({
  user,
  cartItemsCount,
  wishlistCount,
  isModalOpen,
  setIsModalOpen,
}: Options) {
  const getCategoryUrl = useCallback((slug: string) => {
    const queryParams = buildCategoryQuery(slug);
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) searchParams.append(key, String(value));
    });
    return `/shop/${slug}?${searchParams.toString()}`;
  }, []);

  const icons = useMemo<HeaderQuickLink[]>(() => [
    { name: "Home", icon: Home, type: "link", url: "/", requiresAuth: false },
    {
      name: "Consultation",
      icon: Video,
      type: "action",
      requiresAuth: false,
      onClick: () => { if (!user?.email) setIsModalOpen(!isModalOpen); },
    },
    {
      name: "Whatsapp",
      icon: MessageCircle,
      type: "action",
      requiresAuth: false,
      onClick: () => window.open(
        "https://api.whatsapp.com/send?phone=916364945568&text=Hello%20Kankana%20Silks,%20I%E2%80%99m%20interested%20in%20exploring%20your%20saree%20collection.",
        "_blank",
      ),
    },
    { name: "Cart", icon: ShoppingCart, type: "link", url: "/cart", requiresAuth: false, badgeCount: cartItemsCount },
    { name: "Wishlist", icon: Heart, type: "link", url: "/wishlist", requiresAuth: false, badgeCount: wishlistCount },
  ], [user?.email, isModalOpen, setIsModalOpen, cartItemsCount, wishlistCount]);

  return { getCategoryUrl, icons };
}
