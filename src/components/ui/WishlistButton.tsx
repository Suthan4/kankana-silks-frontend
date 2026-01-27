"use client";

import { Heart, Loader2 } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { motion } from "framer-motion";

interface WishlistButtonProps {
  productId: string;
  variant?: "icon" | "button";
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export default function WishlistButton({
  productId,
  variant = "icon",
  size = "md",
  className = "",
  showText = false,
}: WishlistButtonProps) {
  const { toggleWishlist, isProductWishlisted, isAdding, isRemoving } =
    useWishlist();

  const isWishlisted = isProductWishlisted(productId);
  const isLoading = isAdding || isRemoving;

  const sizeClasses = {
    sm: variant === "icon" ? "w-8 h-8" : "px-3 py-2 text-sm",
    md: variant === "icon" ? "w-10 h-10" : "px-4 py-2.5 text-base",
    lg: variant === "icon" ? "w-12 h-12" : "px-6 py-3 text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(productId);
  };

  if (variant === "icon") {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        disabled={isLoading}
        className={`
          ${sizeClasses[size]}
          rounded-full flex items-center justify-center
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isLoading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : (
          <Heart
            className={`${iconSizes[size]} transition-all duration-300 ${
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-current hover:text-red-500"
            }`}
          />
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        rounded-full flex items-center justify-center gap-2
        font-semibold transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          isWishlisted
            ? "bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200"
            : "bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-300"
        }
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <Heart
          className={`${iconSizes[size]} ${isWishlisted ? "fill-red-500" : ""}`}
        />
      )}
      {showText && (
        <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
      )}
    </motion.button>
  );
}
