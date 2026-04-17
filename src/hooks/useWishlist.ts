import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "@/lib/api/wishlist.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { toast } from "sonner";

export function useWishlist() {
  const queryClient = useQueryClient();
  const { user, openModal } = useAuthModal();

  // ✅ Single cache key used everywhere — ["wishlist", user?.id]
  const WISHLIST_KEY = ["wishlist", user?.id];

  const {
    data: wishlistData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: async () => {
      const res = await wishlistApi.getWishlist();
      console.log("🟢 wishlist queryFn res:", res);
      return res.data;
    },    
    enabled: !!user,
  });

  // ─── Add ───────────────────────────────────────────────────────────────────

  const addToWishlistMutation = useMutation({
    mutationFn: (productId: string) =>
      wishlistApi.addToWishlist({ productId }),
    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_KEY });
      const previous = queryClient.getQueryData(WISHLIST_KEY);

      // ✅ Optimistic add
      queryClient.setQueryData(WISHLIST_KEY, (old: any) => {
        if (!old) return old;
        const optimisticItem = {
          id: `optimistic-${productId}`,
          productId,
          createdAt: new Date().toISOString(),
        };
        return {
          ...old,
          data: {
            ...old.data,
            items: [...(old.data?.items ?? []), optimisticItem],
            totalItems: (old.data?.totalItems ?? 0) + 1,
          },
        };
      });

      return { previous };
    },
    onSuccess: () => {
      toast.success("Added to wishlist");
    },
    onError: (error: any, _productId, context) => {
      // ✅ Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(WISHLIST_KEY, context.previous);
      }
      toast.error(error.message || "Failed to add to wishlist");
    },
    onSettled: () => {
      // ✅ Always refetch to get real server state
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEY });
    },
  });

  // ─── Remove ────────────────────────────────────────────────────────────────

  const removeFromWishlistMutation = useMutation({
    mutationFn: (itemId: string) => wishlistApi.removeFromWishlist(itemId),
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_KEY });
      const previous = queryClient.getQueryData(WISHLIST_KEY);

      // ✅ Optimistic remove
      queryClient.setQueryData(WISHLIST_KEY, (old: any) => {
        if (!old) return old;
        console.log("Optimistically removing item:", itemId, old);
        return {
          ...old,
          data: {
            ...old,
            items: old?.items.filter((item: any) => item.id !== itemId),
            totalItems: Math.max((old?.totalItems ?? 1) - 1, 0),
          },
        };
      });

      return { previous };
    },
    onSuccess: () => {
      toast.success("Removed from wishlist");
    },
    onError: (_err, _itemId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(WISHLIST_KEY, context.previous);
      }
      toast.error("Failed to remove item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEY });
    },
  });

  // ─── Clear ─────────────────────────────────────────────────────────────────

  const clearWishlistMutation = useMutation({
    mutationFn: () => wishlistApi.clearWishlist(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_KEY });
      const previous = queryClient.getQueryData(WISHLIST_KEY);

      // ✅ Optimistic clear
      queryClient.setQueryData(WISHLIST_KEY, (old: any) => {
        if (!old) return old;
        console.log("Optimistically clearing wishlist:", old);
        return {
          ...old,
          data: { ...old.data, items: [], totalItems: 0 },
        };
      });

      return { previous };
    },
    onSuccess: () => {
      toast.success("Wishlist cleared");
    },
    onError: (_err, _v, context) => {
      if (context?.previous) {
        queryClient.setQueryData(WISHLIST_KEY, context.previous);
      }
      toast.error("Failed to clear wishlist");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEY });
    },
  });

  // ─── Check ─────────────────────────────────────────────────────────────────

  const checkProductMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.checkProduct(productId),
  });

  // ─── Toggle ────────────────────────────────────────────────────────────────

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      openModal("login");
      toast.info("Please login to add to wishlist");
      return;
    }

    const wishlistItems = wishlistData?.items || [];
    const existingItem = wishlistItems.find(
      (item: any) => item.productId === productId
    );

    if (existingItem) {
      await removeFromWishlistMutation.mutateAsync(existingItem.id);
    } else {
      await addToWishlistMutation.mutateAsync(productId);
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────

  // ✅ String coercion on both sides — prevents id type mismatch (number vs string)
  const isProductWishlisted = (productId: string): boolean => {
    const wishlistItems = wishlistData?.items || [];
    // const wishlistItems = wishlistData?.data || [];
    console.log("Checking if product is wishlisted:", productId, wishlistItems,wishlistData);
    return wishlistItems.some(
      (item: any) => String(item.productId) === String(productId)
    );
  };

  const wishlistCount = wishlistData?.totalItems ?? 0;

  return {
    // Data
    wishlist: wishlistData,
    items: wishlistData?.items || [],
    wishlistCount,

    // States
    isLoading,
    isError,
    error,

    // Mutations
    addToWishlist: addToWishlistMutation.mutateAsync,
    removeFromWishlist: removeFromWishlistMutation.mutateAsync,
    clearWishlist: clearWishlistMutation.mutateAsync,
    toggleWishlist,
    checkProduct: checkProductMutation.mutateAsync,

    // Helpers
    isProductWishlisted,
    refetch,

    // Mutation states
    isAdding: addToWishlistMutation.isPending,
    isRemoving: removeFromWishlistMutation.isPending,
    isClearing: clearWishlistMutation.isPending,
  };
}