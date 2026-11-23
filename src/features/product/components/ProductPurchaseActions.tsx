"use client";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, ShoppingCart, Zap } from "lucide-react";
import { formatMaskedPrice } from "@/lib/utils/priceMasked";
import WishlistButton from "@/components/ui/WishlistButton";

interface ProductPurchaseActionsProps {
  productId: string;
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
  isOutOfStock,
  isAddingToCart,
  onAddToCart,
  onBuyNow,
  onRequestProduct,
}: ProductPurchaseActionsProps) {
  return (
    <div className="hidden md:block flex-none pt-3 space-y-2.5 border-t border-gray-200 mt-2">
      {/* Action Buttons */}
      <div className="flex gap-2.5">
        {isOutOfStock ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRequestProduct}
            className="flex-1 bg-black text-white py-3 rounded-xl font-semibold shadow flex items-center justify-center gap-2 text-sm"
          >
            <AlertCircle className="w-4 h-4" /> Request Product
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAddToCart()}
              disabled={isOutOfStock || isAddingToCart}
              className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold shadow hover:shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="flex-1 bg-main-primary text-main-secondary py-3 rounded-xl font-semibold shadow hover:shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" /> Buy Now
            </motion.button>
          </>
        )}
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
          <span className="bg-main-primary text-main-secondary text-[10px] font-futura-bold px-2 py-0.5 rounded-full">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Buttons row */}
      <div
        className="flex items-center gap-2 px-4 pb-4 pt-1"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        {isOutOfStock ? (
          /* Out of stock — Request button full width */
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onRequestProduct}
            className="flex-1 bg-black text-white py-3.5 rounded-xl font-futura-bold text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            <AlertCircle className="w-4 h-4" />
            Request Product
          </motion.button>
        ) : (
          <>
            {/* Add to Cart */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onAddToCart()}
              disabled={isOutOfStock || isAddingToCart}
              className="flex-1 bg-gray-900 text-white py-3.5 rounded-xl font-futura-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding to Cart...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </motion.button>

            {/* Buy Now */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onBuyNow}
              disabled={isOutOfStock}
              className="flex-1 bg-main-primary text-main-secondary py-3.5 rounded-xl font-futura-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" />
              Buy Now
            </motion.button>

            {/* Wishlist icon button */}
            <WishlistButton
              productId={productId}
              variant="icon"
              size="md"
              className="w-12 h-12 flex-shrink-0 bg-gray-100 hover:bg-gray-200 rounded-xl border border-gray-200 flex items-center justify-center"
            />
          </>
        )}
      </div>
    </div>
  );
}
