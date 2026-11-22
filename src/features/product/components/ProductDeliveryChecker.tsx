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
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin className="w-4 h-4 text-gray-700" />
                      <h3 className="font-semibold text-gray-900 text-xs">
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            onCheckDeliveryAvailability(pincode);
                        }}
                      />
                      <button
                        onClick={onCheckDelivery}
                        disabled={isCheckingDelivery}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-xs font-medium disabled:opacity-50"
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
                            ? "bg-[#58292C]/10 border border-[#58292C]/20"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        {deliveryInfo.isServiceable ? (
                          <Check className="w-4 h-4 text-main-secondary flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                        )}
                        <div>
                          <p
                            className={`font-medium text-sm ${
                              deliveryInfo.isServiceable
                                ? "text-main-primary"
                                : "text-red-900"
                            }`}
                          >
                            {deliveryInfo.isServiceable
                              ? "Delivery Available"
                              : "Not Serviceable"}
                          </p>
                          {deliveryInfo.isServiceable && (
                            <p className="text-xs text-main-secondary">
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
