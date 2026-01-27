import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "@/lib/api/wishlist.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { toast } from "sonner";

export function useWishlist() {
  const queryClient = useQueryClient();
  const { user, openModal } = useAuthModal();

  // Fetch wishlist
  const {
    data: wishlistData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.getWishlist(),
    enabled: !!user,
    retry: 1,
    staleTime: 30000,
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: (productId: string) =>
      wishlistApi.addToWishlist({ productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Added to wishlist");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add to wishlist");
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: (itemId: string) => wishlistApi.removeFromWishlist(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData(["wishlist"]);

      // Optimistically update
      queryClient.setQueryData(["wishlist"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.filter((item: any) => item.id !== itemId),
            totalItems: old.data.totalItems - 1,
          },
        };
      });

      return { previousWishlist };
    },
    onSuccess: () => {
      toast.success("Removed from wishlist");
    },
    onError: (err, itemId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      toast.error("Failed to remove item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  // Clear wishlist mutation
  const clearWishlistMutation = useMutation({
    mutationFn: () => wishlistApi.clearWishlist(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Wishlist cleared");
    },
    onError: () => {
      toast.error("Failed to clear wishlist");
    },
  });

  // Check if product is in wishlist
  const checkProductMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.checkProduct(productId),
  });

  // Toggle wishlist (add or remove)
  const toggleWishlist = async (productId: string) => {
    if (!user) {
      openModal("login");
      toast.info("Please login to add to wishlist");
      return;
    }

    // Check if product is in wishlist
    const wishlistItems = wishlistData?.data?.items || [];
    const existingItem = wishlistItems.find(
      (item: any) => item.productId === productId
    );

    if (existingItem) {
      // Remove from wishlist
      await removeFromWishlistMutation.mutateAsync(existingItem.id);
    } else {
      // Add to wishlist
      await addToWishlistMutation.mutateAsync(productId);
    }
  };

  // Check if a specific product is wishlisted
  const isProductWishlisted = (productId: string): boolean => {
    const wishlistItems = wishlistData?.data?.items || [];
    return wishlistItems.some((item: any) => item.productId === productId);
  };

  // Get wishlist item count
  const wishlistCount = wishlistData?.data?.totalItems ?? 0;

  return {
    // Data
    wishlist: wishlistData?.data,
    items: wishlistData?.data?.items || [],
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