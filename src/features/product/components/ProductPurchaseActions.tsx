"use client";
import { motion } from "framer-motion";
import { Loader2, ShoppingCart, Zap } from "lucide-react";
import { formatMaskedPrice } from "@/lib/utils/priceMasked";
import WishlistButton from "@/components/ui/WishlistButton";
import { ProductRequestStatusButton } from "@/features/product/components/ProductRequestStatusButton";

interface ProductPurchaseActionsProps {
  productId: string;
  variantId?: string | null;
  isOutOfStock: boolean;
  isAddingToCart: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onRequestProduct: () => void;
  displayPrice: number;
  basePrice: number;
  discount: number;
}

export function ProductDesktopPurchaseActions({
  productId,
  variantId,
  isOutOfStock,
  isAddingToCart,
  onAddToCart,
  onBuyNow,
  onRequestProduct,
}: ProductPurchaseActionsProps) {
  return (
    <div className="hidden md:block flex-none pt-3 space-y-2.5 border-t border-gray-200 mt-2">
      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5">
        <ProductRequestStatusButton
          productId={productId}
          variantId={variantId}
          onRequest={onRequestProduct}
          showWhenNoRequest={isOutOfStock}
          className="brand-button w-full rounded-xl py-3 text-sm"
        />
        {!isOutOfStock ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAddToCart()}
              disabled={isOutOfStock || isAddingToCart}
              className="brand-button flex-1 rounded-xl py-3 text-sm disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBuyNow}
              disabled={isOutOfStock}
              className="brand-outline-button flex-1 rounded-xl py-3 text-sm disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" /> Buy Now
            </motion.button>
          </>
        ) : null}
        <WishlistButton
          productId={productId}
          variant="icon"
          size="md"
          className="bg-white hover:bg-gray-100 shadow border border-gray-200 rounded-xl px-3"
        />
      </div>

      {/* Trust badges */}
      {/* <div className="grid grid-cols-3 gap-2">
                  {[{ icon: Shield, label: "Secure Payment" }].map(
                    ({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 rounded-lg"
                      >
                        <Icon className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                        <p className="text-[10px] text-gray-600 font-medium">
                          {label}
                        </p>
                      </div>
                    ),
                  )}
                </div> */}
    </div>
  );
}

export function ProductMobilePurchaseActions({
  productId,
  variantId,
  isOutOfStock,
  isAddingToCart,
  onAddToCart,
  onBuyNow,
  onRequestProduct,
  displayPrice,
  basePrice,
  discount,
}: ProductPurchaseActionsProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
      {/* Price strip */}
      <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-futura-bold text-gray-900">
            {isOutOfStock
              ? formatMaskedPrice(displayPrice)
              : `₹${displayPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">
              {isOutOfStock
                ? formatMaskedPrice(basePrice)
                : `₹${basePrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          )}
        </div>
        {discount > 0 && !isOutOfStock && (
          <span className="brand-badge brand-badge--sale text-[10px] font-futura-bold">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Buttons row */}
      <div
        className="flex flex-col gap-2 px-4 pb-4 pt-1"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        <ProductRequestStatusButton
          productId={productId}
          variantId={variantId}
          onRequest={onRequestProduct}
          showWhenNoRequest={isOutOfStock}
          className="brand-button w-full rounded-xl py-3.5 font-futura-bold text-sm"
        />
        {!isOutOfStock ? (
          <>
            {/* Add to Cart */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onAddToCart()}
              disabled={isOutOfStock || isAddingToCart}
              aria-label={isAddingToCart ? "Adding to cart" : "Add to cart"}
              className="
    brand-button brand-button--compact
    flex-1 min-w-0
    rounded-xl
    disabled:cursor-not-allowed
  "
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  <span className="whitespace-nowrap">Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">Add to Cart</span>
                </>
              )}
            </motion.button>

            {/* Buy Now */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onBuyNow}
              disabled={isOutOfStock}
              className="brand-outline-button flex-1 rounded-xl py-3.5 font-futura-bold text-sm disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" />
              Buy Now
            </motion.button>

            {/* Wishlist icon button */}
            <WishlistButton
              productId={productId}
              variant="icon"
              size="md"
              className="w-12 h-12 flex-shrink-0 rounded-xl border border-brand-border bg-brand-primary-soft hover:bg-brand-primary-muted flex items-center justify-center"
            />
          </>
        )}
      </div>
    </div>
  );
}
