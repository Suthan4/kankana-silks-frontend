"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Info, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { toast } from "@/store/useToastStore";
import { useCreateReturn } from "@/hooks/useUserReturns";
import { getReturnReasonLabel, isFreeReturnReason, RefundMethod, ReturnReason } from "@/lib/api/return.api";

interface ReturnModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReturnModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: ReturnModalProps) {
  const { createReturn, loading } = useCreateReturn();

  const [selectedItems, setSelectedItems] = useState<
    Array<{ orderItemId: string; quantity: number }>
  >([]);
  const [reason, setReason] = useState<ReturnReason>(ReturnReason.DEFECTIVE);
  const [reasonDetails, setReasonDetails] = useState("");
  const [refundMethod, setRefundMethod] = useState<RefundMethod>(
    RefundMethod.ORIGINAL_PAYMENT,
  );
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });

  const handleToggleItem = (orderItemId: string) => {
    const exists = selectedItems.find(
      (item) => item.orderItemId === orderItemId,
    );
    if (exists) {
      setSelectedItems(
        selectedItems.filter((item) => item.orderItemId !== orderItemId),
      );
    } else {
      setSelectedItems([...selectedItems, { orderItemId, quantity: 1 }]);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to return");
      return;
    }

    if (!reasonDetails || reasonDetails.length < 10) {
      toast.error("Please provide detailed reason (minimum 10 characters)");
      return;
    }

    if (
      refundMethod === RefundMethod.BANK_TRANSFER &&
      (!bankDetails.accountHolderName ||
        !bankDetails.accountNumber ||
        !bankDetails.ifscCode)
    ) {
      toast.error(
        "Please provide complete bank details for bank transfer refund",
      );
      return;
    }

    try {
      await createReturn({
        orderId: order.id,
        orderItems: selectedItems.map((item) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          reason,
        })),
        reasonDetails,
        refundMethod,
        bankDetails:
          refundMethod === RefundMethod.BANK_TRANSFER ? bankDetails : undefined,
      });

      toast.success("Return request submitted successfully!");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit return request");
    }
  };

  const isFreeReturn = isFreeReturnReason(reason);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">Return Order</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {order.orderNumber}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Free vs Paid Return Info */}
              <div
                className={`${
                  isFreeReturn
                    ? "bg-blue-50 border-blue-200"
                    : "bg-orange-50 border-orange-200"
                } border-2 rounded-xl p-4 flex items-start gap-3`}
              >
                <Info
                  className={`w-5 h-5 ${isFreeReturn ? "text-blue-600" : "text-orange-600"} flex-shrink-0 mt-0.5`}
                />
                <div>
                  <p
                    className={`font-semibold ${isFreeReturn ? "text-blue-900" : "text-orange-900"}`}
                  >
                    {isFreeReturn ? "🎉 Free Return" : "💰 Paid Return"}
                  </p>
                  <p
                    className={`text-sm ${isFreeReturn ? "text-blue-700" : "text-orange-700"} mt-1`}
                  >
                    {isFreeReturn
                      ? "No shipping charges will be deducted"
                      : "Reverse shipping charges will be deducted from refund"}
                  </p>
                </div>
              </div>

              {/* Select Items */}
              <div>
                <h3 className="font-semibold mb-3">Select Items to Return *</h3>
                <div className="space-y-2">
                  {order.items.map((item: any) => {
                    const isSelected = selectedItems.some(
                      (si) => si.orderItemId === item.id,
                    );

                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => handleToggleItem(item.id)}
                        className={`flex gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-5 h-5 mt-1 cursor-pointer"
                        />
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden ring-2 ring-gray-200 flex-shrink-0">
                          <Image
                            src={
                              item.product.media[0]?.thumbnailUrl ||
                              item.product.media[0]?.url ||
                              "/images/placeholder.png"
                            }
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Qty: {item.quantity} | ₹
                            {Number(item.price).toFixed(2)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Return Reason */}
              <div>
                <label className="block font-semibold mb-2">
                  Reason for Return *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReturnReason)}
                  className="w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={ReturnReason.DEFECTIVE}>
                    {getReturnReasonLabel(ReturnReason.DEFECTIVE)} (Free)
                  </option>
                  <option value={ReturnReason.WRONG_ITEM}>
                    {getReturnReasonLabel(ReturnReason.WRONG_ITEM)} (Free)
                  </option>
                  <option value={ReturnReason.NOT_AS_DESCRIBED}>
                    {getReturnReasonLabel(ReturnReason.NOT_AS_DESCRIBED)} (Free)
                  </option>
                  <option value={ReturnReason.DAMAGED_IN_TRANSIT}>
                    {getReturnReasonLabel(ReturnReason.DAMAGED_IN_TRANSIT)}{" "}
                    (Free)
                  </option>
                  <option value={ReturnReason.SIZE_ISSUE}>
                    {getReturnReasonLabel(ReturnReason.SIZE_ISSUE)} (Paid)
                  </option>
                  <option value={ReturnReason.COLOR_DIFFERENCE}>
                    {getReturnReasonLabel(ReturnReason.COLOR_DIFFERENCE)} (Paid)
                  </option>
                  <option value={ReturnReason.QUALITY_ISSUE}>
                    {getReturnReasonLabel(ReturnReason.QUALITY_ISSUE)} (Paid)
                  </option>
                  <option value={ReturnReason.CHANGED_MIND}>
                    {getReturnReasonLabel(ReturnReason.CHANGED_MIND)} (Paid)
                  </option>
                  <option value={ReturnReason.OTHER}>
                    {getReturnReasonLabel(ReturnReason.OTHER)} (Paid)
                  </option>
                </select>
              </div>

              {/* Reason Details */}
              <div>
                <label className="block font-semibold mb-2">
                  Detailed Reason * (min 10 characters)
                </label>
                <textarea
                  value={reasonDetails}
                  onChange={(e) => setReasonDetails(e.target.value)}
                  rows={3}
                  placeholder="Please provide details about why you're returning..."
                  className="w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reasonDetails.length}/10 characters
                </p>
              </div>

              {/* Refund Method */}
              <div>
                <label className="block font-semibold mb-2">
                  Refund Method *
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) =>
                    setRefundMethod(e.target.value as RefundMethod)
                  }
                  className="w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={RefundMethod.ORIGINAL_PAYMENT}>
                    Original Payment Method
                  </option>
                  <option value={RefundMethod.BANK_TRANSFER}>
                    Bank Transfer
                  </option>
                  <option value={RefundMethod.STORE_CREDIT}>
                    Store Credit
                  </option>
                </select>
              </div>

              {/* Bank Details (if bank transfer) */}
              {refundMethod === RefundMethod.BANK_TRANSFER && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-gray-50 rounded-lg space-y-3"
                >
                  <h4 className="font-semibold">Bank Account Details *</h4>
                  <input
                    type="text"
                    placeholder="Account Holder Name *"
                    value={bankDetails.accountHolderName}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        accountHolderName: e.target.value,
                      })
                    }
                    className="w-full border-2 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Account Number *"
                    value={bankDetails.accountNumber}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        accountNumber: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full border-2 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code *"
                    value={bankDetails.ifscCode}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        ifscCode: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full border-2 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Bank Name (Optional)"
                    value={bankDetails.bankName}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        bankName: e.target.value,
                      })
                    }
                    className="w-full border-2 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  disabled={loading}
                  type="button"
                  className="flex-1 py-3 border-2 border-gray-200 rounded-lg font-medium hover:bg-white disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={loading || selectedItems.length === 0}
                  type="button"
                  className="flex-1 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Return Request"
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
