"use client";
import { motion } from "framer-motion";
import { Check, MapPin, X } from "lucide-react";

export interface ProductDeliveryInfo {
  isServiceable: boolean;
  estimatedDays: string;
  checked: boolean;
}

interface ProductDeliveryCheckerProps {
  isOutOfStock: boolean;
  pincode: string;
  onPincodeChange: (value: string) => void;
  deliveryInfo: ProductDeliveryInfo | null;
  isCheckingDelivery: boolean;
  onCheckDelivery: () => void;
  onCheckDeliveryAvailability: (pincode: string) => void;
}

export function ProductDeliveryChecker({
  isOutOfStock,
  pincode,
  onPincodeChange,
  deliveryInfo,
  isCheckingDelivery,
  onCheckDelivery,
  onCheckDeliveryAvailability,
}: ProductDeliveryCheckerProps) {
  return (
    <>
      {!isOutOfStock && (
                  <div className="bg-brand-primary-soft rounded-xl p-3 border border-brand-border">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin className="w-4 h-4 text-brand-primary" />
                      <h3 className="font-semibold text-text-heading text-xs">
                        Check Delivery
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Pincode"
                        value={pincode}
                        onChange={(e) => onPincodeChange(e.target.value)}
                        maxLength={6}
                        className="brand-input min-w-0 flex-1 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            onCheckDeliveryAvailability(pincode);
                        }}
                      />
                      <button
                        onClick={onCheckDelivery}
                        disabled={isCheckingDelivery}
                        className="brand-button min-h-10 rounded-lg px-4 py-2 text-xs disabled:opacity-50"
                      >
                        {isCheckingDelivery ? "..." : "Check"}
                      </button>
                    </div>

                    {deliveryInfo?.checked && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-2 p-3 rounded-xl flex items-center gap-2 ${
                          deliveryInfo.isServiceable
                            ? "brand-status-success"
                            : "brand-status-error"
                        }`}
                      >
                        {deliveryInfo.isServiceable ? (
                          <Check className="w-4 h-4 text-success flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-error flex-shrink-0" />
                        )}
                        <div>
                          <p
                            className={`font-medium text-sm ${
                              deliveryInfo.isServiceable
                                ? "text-success"
                                : "text-error"
                            }`}
                          >
                            {deliveryInfo.isServiceable
                              ? "Delivery Available"
                              : "Not Serviceable"}
                          </p>
                          {deliveryInfo.isServiceable && (
                            <p className="text-xs text-success">
                              Expected in {deliveryInfo.estimatedDays}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
    </>
  );
}
