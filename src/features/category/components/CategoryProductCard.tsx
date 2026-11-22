"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, Heart } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/api/product.api";
import type { CartLineLike } from "@/lib/utils/cartItems";
import { formatMaskedPrice } from "@/lib/utils/priceMasked";
import { getCartItemStockState } from "@/lib/utils/cartStock";

interface CategoryProductCardProps {
  product: Product;
  index: number;
  isOutOfStock: boolean;
  showAddToCart: boolean;
  selectedVariant: ProductVariant | null;
  cartItem: CartLineLike | null;
  isWishlisted: boolean;
  isAddingToCart: boolean;
  onToggleWishlist: () => void;
  onViewOptions: () => void;
  onRequestProduct: () => void;
  onAddToCart: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

export function CategoryProductCard({
  product,
  index,
  isOutOfStock,
  showAddToCart,
  selectedVariant,
  cartItem,
  isWishlisted,
  isAddingToCart,
  onToggleWishlist,
  onViewOptions,
  onRequestProduct,
  onAddToCart,
  onIncrease,
  onDecrease,
}: CategoryProductCardProps) {
  const displayPrice = Number(product.sellingPrice);
  const basePrice = Number(product.basePrice);
  const discount =
    basePrice > displayPrice
      ? Math.round(((basePrice - displayPrice) / basePrice) * 100)
      : 0;
  const variants = product.variants ?? [];
  const hasVariants = product.hasVariants && variants.length > 0;
  const cartStockState = getCartItemStockState({
    product,
    variant: selectedVariant ?? undefined,
    variantId: selectedVariant?.id,
    quantity: cartItem?.quantity ?? 0,
    allowOutOfStockOrders: product.allowOutOfStockOrders,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group"
    >
      <Link href={`/${product.category?.slug}/${product.slug}`}>
        <div className="relative overflow-hidden bg-[#f5f2ee]">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f5f2ee]">
            <Image
              src={product.media?.[0]?.url || "/placeholder.jpg"}
              alt={product.name}
              fill
              priority={index < 3}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            {!isOutOfStock && discount > 0 && (
              <div className="absolute left-3 top-3 bg-main-primary px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-main-secondary">
                {discount}% Off
              </div>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleWishlist();
              }}
              aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              aria-pressed={isWishlisted}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm opacity-100 transition-all duration-300 hover:bg-white md:opacity-0 md:group-hover:opacity-100"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-black text-black" : "text-black"}`} />
            </button>
          </div>
        </div>
      </Link>

      <div className="pt-3">
        <Link href={`/${product.category?.slug}/${product.slug}`}>
          <h3 className="min-h-[38px] text-[13px] leading-[1.35] tracking-tight text-gray-900 line-clamp-2 underline-offset-2 decoration-gray-300 hover:underline md:min-h-[44px] md:text-sm">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-sm font-medium tracking-tight text-black">
            {isOutOfStock
              ? formatMaskedPrice(displayPrice)
              : `₹${displayPrice.toLocaleString("en-IN")}`}
          </span>
          {basePrice > displayPrice && (
            <span className="text-xs text-gray-400 line-through">
              {isOutOfStock
                ? formatMaskedPrice(basePrice)
                : `₹${basePrice.toLocaleString("en-IN")}`}
            </span>
          )}
        </div>

        <div className="mt-3">
          {showAddToCart ? (
            hasVariants && variants.length > 1 ? (
              <button
                type="button"
                onClick={onViewOptions}
                className="w-full border border-black py-2.5 text-xs uppercase tracking-widest transition-colors hover:bg-black hover:text-white"
              >
                View Options
              </button>
            ) : cartItem && Number(cartItem.quantity ?? 0) > 0 ? (
              <div className="flex items-center border border-gray-200">
                <button
                  type="button"
                  onClick={onDecrease}
                  aria-label={`Decrease ${product.name} quantity`}
                  className="flex-1 py-2.5 text-sm transition-colors hover:bg-gray-50"
                >
                  −
                </button>
                <span className="flex-1 text-center text-sm font-medium">
                  {cartItem.quantity}
                </span>
                <button
                  type="button"
                  onClick={onIncrease}
                  aria-label={`Increase ${product.name} quantity`}
                  disabled={Number(cartItem.quantity) >= cartStockState.maxAllowed}
                  className="flex-1 py-2.5 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onAddToCart}
                disabled={isAddingToCart}
                aria-busy={isAddingToCart}
                className="w-full bg-black py-2.5 text-xs uppercase tracking-widest text-white transition-colors hover:bg-gray-900 disabled:cursor-wait disabled:opacity-70"
              >
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </button>
            )
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onRequestProduct}
              className="flex w-full items-center justify-center gap-2 bg-black py-2.5 text-xs uppercase tracking-widest text-white transition-colors hover:bg-gray-900 disabled:cursor-wait disabled:opacity-70"
            >
              <AlertCircle className="h-4 w-4" />
              Request Product
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
