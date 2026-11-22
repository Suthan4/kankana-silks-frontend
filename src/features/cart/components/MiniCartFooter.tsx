"use client";

import { memo } from "react";
import { ArrowRight } from "lucide-react";

interface MiniCartFooterProps {
  totalItems: number;
  subtotal: number;
  onCheckout: () => void;
  onViewCart: () => void;
  onClose: () => void;
}

export const MiniCartFooter = memo(function MiniCartFooter({
  totalItems,
  subtotal,
  onCheckout,
  onViewCart,
  onClose,
}: MiniCartFooterProps) {
  return (
    <div className="p-5 border-t border-gray-100 bg-white/95 backdrop-blur-xs space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Subtotal ({totalItems} items)
        </span>
        <span className="font-bold text-base text-gray-900">
          ₹{subtotal.toLocaleString("en-IN")}
        </span>
      </div>
      <p className="text-[11px] text-gray-400">
        Shipping and taxes calculated at checkout.
      </p>

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={onCheckout}
          className="w-full bg-black text-white hover:bg-neutral-800 transition-colors py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onViewCart}
          className="w-full bg-white text-black border border-gray-300 hover:bg-gray-50 transition-colors py-2.5 rounded-xl font-medium text-xs sm:text-sm"
        >
          View Full Cart
        </button>

        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-gray-900 text-center py-1 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
});
