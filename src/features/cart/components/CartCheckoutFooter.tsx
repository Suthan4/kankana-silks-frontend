"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CartCheckoutFooterProps {
  total: number;
  discount: number;
  isValid: boolean;
  onCheckout: () => void;
  formatMoney: (value: number) => string;
}

export function CartCheckoutFooter({
  total,
  discount,
  isValid,
  onCheckout,
  formatMoney,
}: CartCheckoutFooterProps) {
  return (
    <div className="flex-none border-t border-gray-200 px-4 py-3 bg-white">
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-futura-bold text-gray-900 text-sm">Total</span>
        <div className="text-right">
          <span className="text-2xl font-futura-bold text-gray-900">
            {formatMoney(total)}
          </span>
          <p className="text-[10px] text-gray-400">incl. all taxes</p>
        </div>
      </div>

      {discount > 0 && (
        <p className="text-xs text-green-600 font-semibold text-right mb-2">
          🎉 You saved {formatMoney(discount)}
        </p>
      )}

      <motion.button
        whileHover={isValid ? { scale: 1.01 } : undefined}
        whileTap={isValid ? { scale: 0.99 } : undefined}
        onClick={onCheckout}
        disabled={!isValid}
        aria-disabled={!isValid}
        className="w-full bg-gray-900 text-white py-3 rounded-xl font-futura-bold shadow hover:shadow-md transition flex items-center justify-center gap-2 text-sm group disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {isValid ? "Proceed to Checkout" : "Update cart to continue"}
        {isValid && (
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
        )}
      </motion.button>
    </div>
  );
}
