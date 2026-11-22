"use client";

import { motion } from "framer-motion";
import { Gift, Loader2 } from "lucide-react";

interface CartPriceBreakdownProps {
  totalItems: number;
  subtotal: number;
  discount: number;
  couponCode?: string;
  selectedCourierName?: string;
  shippingCost: number;
  shippingData: { isFreeShipping?: boolean } | null | undefined;
  isLoadingShipping: boolean;
  cgstAmount: number;
  sgstAmount: number;
  gstAmount: number;
  formatMoney: (value: number) => string;
}

export function CartPriceBreakdown({
  totalItems,
  subtotal,
  discount,
  couponCode,
  selectedCourierName,
  shippingCost,
  shippingData,
  isLoadingShipping,
  cgstAmount,
  sgstAmount,
  gstAmount,
  formatMoney,
}: CartPriceBreakdownProps) {
  return (
    <div className="space-y-2 pt-3 border-t border-gray-100">
      <div className="flex justify-between text-xs text-gray-600">
        <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
        <span className="font-semibold text-gray-900">{formatMoney(subtotal)}</span>
      </div>

      {discount > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-between text-xs text-green-600 font-semibold bg-green-50 -mx-1 px-1 py-1 rounded"
        >
          <span className="flex items-center gap-1">
            <Gift className="w-3 h-3" />
            Coupon ({couponCode})
          </span>
          <span>-{formatMoney(discount)}</span>
        </motion.div>
      )}

      <div className="flex justify-between text-xs text-gray-600">
        <div>
          <span>Shipping</span>
          {selectedCourierName && (
            <p className="text-[10px] text-main-primary">{selectedCourierName}</p>
          )}
        </div>
        <span className={`font-semibold ${shippingCost === 0 && shippingData ? "text-main-primary" : "text-gray-900"}`}>
          {!shippingData ? (
            isLoadingShipping ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "—"
          ) : shippingData.isFreeShipping ? (
            "Free"
          ) : (
            formatMoney(shippingCost)
          )}
        </span>
      </div>

      {gstAmount > 0 && (
        <>
          <div className="flex justify-between text-xs text-gray-500">
            <span>CGST (2.5%)</span>
            <span>{formatMoney(cgstAmount)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>SGST (2.5%)</span>
            <span>{formatMoney(sgstAmount)}</span>
          </div>
        </>
      )}
    </div>
  );
}
