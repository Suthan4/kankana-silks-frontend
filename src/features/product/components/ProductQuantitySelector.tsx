"use client";
import { motion } from "framer-motion";

interface ProductQuantitySelectorProps {
  isOutOfStock: boolean;
  quantity: number;
  maxAllowedQuantity: number;
  canIncreaseQuantity: boolean;
  onQuantityChange: (quantity: number) => void;
}

export function ProductQuantitySelector({
  isOutOfStock,
  quantity,
  maxAllowedQuantity,
  canIncreaseQuantity,
  onQuantityChange,
}: ProductQuantitySelectorProps) {
  return (
    <>
      {!isOutOfStock && (
        <div>
          <h3 className="font-semibold text-gray-900 text-xs mb-1.5">
            Quantity
          </h3>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-futura-bold text-sm"
            >
              −
            </motion.button>
            <span className="text-lg font-semibold w-8 text-center">
              {quantity}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (canIncreaseQuantity) {
                  onQuantityChange(Math.min(maxAllowedQuantity, quantity + 1));
                }
              }}
              disabled={!canIncreaseQuantity}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-futura-bold text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </motion.button>
          </div>
        </div>
      )}
    </>
  );
}
