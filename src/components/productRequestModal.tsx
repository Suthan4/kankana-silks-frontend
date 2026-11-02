"use client";

import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Send, Package } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { productRequestApi } from "@/lib/api/product-request.api";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/lib/api/product.api";

interface ProductRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedVariant?: ProductVariant | null;
  // onSuccess?: () => void;
}

export default function ProductRequestModal({
  isOpen,
  onClose,
  product,
  selectedVariant,
  // onSuccess,
}: ProductRequestModalProps) {
  useModalScrollLock(isOpen);

  const [message, setMessage] = useState("");

  const requestMutation = useMutation({
    mutationFn: async () => {
      return await productRequestApi.createRequest({
        productId: product.id,
        variantId: selectedVariant?.id,
        requestType: "OUT_OF_STOCK",
        message: message || `Request for out-of-stock product: ${product.name}`,
      });
    },
    onSuccess: () => {
      toast.success("Request submitted successfully!", {
        description: "We'll notify you when this product is back in stock.",
      });
      setMessage("");
      onClose();
      // onSuccess?.();
    },
    onError: (error: any) => {
      toast.error("Failed to submit request", {
        description: error.message || "Please try again later.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestMutation.isPending) return;
    requestMutation.mutate();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="relative bg-gray-100 p-6 border-b border-gray-100">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-black rounded-xl shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Request Product
                    </h3>
                    <p className="text-sm text-gray-600">
                      We'll notify you when it's available
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6">
                {/* Product Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {product.name}
                  </p>
                  {selectedVariant && (
                    <div className="flex gap-2 text-xs text-gray-600">
                      {selectedVariant.size && (
                        <span className="px-2 py-1 bg-white rounded-md border border-gray-200">
                          Size: {selectedVariant.size}
                        </span>
                      )}
                      {selectedVariant.color && (
                        <span className="px-2 py-1 bg-white rounded-md border border-gray-200">
                          Color: {selectedVariant.color}
                        </span>
                      )}
                      {selectedVariant.fabric && (
                        <span className="px-2 py-1 bg-white rounded-md border border-gray-200">
                          Fabric: {selectedVariant.fabric}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Additional Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Let us know if you have any specific requirements..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none transition-shadow text-sm"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {message.length}/500 characters
                  </p>
                </div>

                {/* Info Banner */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">What happens next?</p>
                    <p className="text-blue-700">
                      We'll email you as soon as this product is back in stock.
                      You can track all your requests in your account.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap:3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={requestMutation.isPending}
                    className="min-w-[110px] px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestMutation.isPending}
                    className="flex-1 min-w-0 px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                  >
                    {requestMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span className="truncate">Submit Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
