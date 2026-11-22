"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authModalStore, useAuthModal } from "@/store/useAuthModalStore";
import { useCartStore } from "@/store/useCartStore";
import clientApiService from "@/lib/api/api.client.service";
import categoryService from "@/lib/api/category.api";
import { cartApi } from "@/lib/api/cart.api";
import { wishlistApi } from "@/lib/api/wishlist.api";
import { toast } from "@/store/useToastStore";

export function useHeaderData() {
  const { user, openModal } = useAuthModal();
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const localCartItemsCount = useCartStore((state) => state.getTotalItems());

  const { data: cartData } = useQuery({
    queryKey: ["cartApi", user?.id],
    queryFn: async () => {
      const response = await cartApi.getCart();
      return response.data;
    },
    enabled: !!user,
    staleTime: 0,
    placeholderData: { items: [] },
  });

  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      const response = await wishlistApi.getWishlist();
      return response.data;
    },
    enabled: !!user,
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      const response = await import("@/lib/api/addresses.api").then((module) =>
        module.addressApi.getAddresses(),
      );
      return response.data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    placeholderData: [],
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: async () => categoryService.getCategoryTree(),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    placeholderData: [],
    retry: 1,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartItemsCount = isMounted
    ? user
      ? (cartData?.items ?? []).length
      : localCartItemsCount
    : 0;
  const wishlistCount = isMounted
    ? user
      ? (wishlistData?.totalItems ?? 0)
      : 0
    : 0;

  const handleLogout = async () => {
    try {
      await clientApiService.logout();
    } catch (error) {
      console.warn(
        "Server logout request failed; clearing local session.",
        error,
      );
    } finally {
      authModalStore.getState().logout();
      queryClient.clear();
      localStorage.removeItem("userLocation");
      localStorage.removeItem("cart-storage");
      localStorage.removeItem("auth-modal-storage");
      toast.success("Logged out successfully");
    }
  };

  const defaultAddress = addresses.find((address) => address.isDefault);

  return {
    user,
    openModal,
    isMounted,
    cartItemsCount,
    wishlistCount,
    categories,
    isCategoriesLoading,
    addresses,
    defaultAddress,
    handleLogout,
  };
}

