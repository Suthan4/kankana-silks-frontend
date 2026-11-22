"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartStockState } from "@/lib/utils/cartStock";

interface MiniCartItemRowProps {
  item: any;
  itemPrice: number;
  imageUrl: string;
  stockState: CartStockState;
  isLastOneInCart: boolean;
  hasOnlyOneRemaining: boolean;
  remainingStock: number;
  variantAttrs: Array<{ key: string; value: string }>;
  isUpdating: boolean;
  isRemoving: boolean;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function MiniCartItemRow({
  item,
  itemPrice,
  imageUrl,
  stockState,
  isLastOneInCart,
  hasOnlyOneRemaining,
  remainingStock,
  variantAttrs,
  isUpdating,
  isRemoving,
  onQuantityChange,
  onRemove,
}: MiniCartItemRowProps) {
  const cartQuantity = Math.max(0, Number(item.quantity) || 0);
  const canIncrease = stockState.hasStockData &&
    !stockState.isOutOfStock &&
    cartQuantity < stockState.maxAllowed;

  return (
    <div className="py-4 flex gap-3.5 items-start group">
      <div className="relative w-18 h-22 sm:w-20 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
        <Image
          src={imageUrl}
          alt={item.product?.name || "Cart item"}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
          {item.product?.name || "Product"}
        </h4>
        {variantAttrs.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {variantAttrs.map((attr, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-normal"
              >
                {attr.key}: {attr.value}
              </span>
            ))}
          </div>
        )}

        {stockState.isOutOfStock ? (
          <div className="mt-1">
            <span className="inline-flex items-center text-[11px] font-medium text-red-700 bg-red-50 border border-red-200/70 px-2 py-0.5 rounded-md">
              Out of stock
            </span>
          </div>
        ) : isLastOneInCart ? (
          <div className="mt-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Last one available — order yours now!
            </span>
          </div>
        ) : stockState.isLimited ? (
          <div className="mt-1">
            <span className="inline-flex items-center text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md">
              Limited availability — order yours now!
            </span>
          </div>
        ) : hasOnlyOneRemaining ? (
          <div className="mt-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Only 1 left in stock
            </span>
          </div>
        ) : stockState.hasStockData && remainingStock > 1 && remainingStock <= 5 ? (
          <div className="mt-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Only {remainingStock} left in stock
            </span>
          </div>
        ) : null}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-200 rounded-md bg-white">
            <button
              type="button"
              onClick={() => onQuantityChange(Number(item.quantity) - 1)}
              disabled={cartQuantity <= 1 || isUpdating}
              aria-label="Decrease quantity"
              className="p-1 sm:p-1.5 text-gray-500 hover:text-black transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 text-xs font-semibold min-w-[20px] text-center text-gray-800 select-none">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(Number(item.quantity) + 1)}
              disabled={isUpdating || !canIncrease}
              aria-label="Increase quantity"
              className="p-1 sm:p-1.5 text-gray-500 hover:text-black transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-xs sm:text-sm text-gray-900">
              ₹{(itemPrice * (Number(item.quantity) || 1)).toLocaleString("en-IN")}
            </span>
            <button
              type="button"
              onClick={onRemove}
              disabled={isRemoving}
              aria-label="Remove item"
              className="text-gray-400 hover:text-red-500 transition p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
