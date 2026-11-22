"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard } from "lucide-react";
import type { PaymentMethodType } from "@/lib/api/order.api";
import PaymentLogos from "@/components/paymentLogos";
import { CheckoutAccordionCard } from "./CheckoutAccordionCard";

const PAYMENT_METHODS: Array<{
  id: PaymentMethodType;
  title: string;
  subtitle: string;
  recommended?: boolean;
  razorpay: boolean;
}> = [
  {
    id: "UPI",
    title: "UPI",
    subtitle: "Google Pay, PhonePe, Paytm & more",
    recommended: true,
    razorpay: true,
  },
  {
    id: "CARD",
    title: "Credit / Debit Card",
    subtitle: "Visa, Mastercard, RuPay",
    razorpay: true,
  },
  {
    id: "NETBANKING",
    title: "Net Banking",
    subtitle: "All major banks",
    razorpay: true,
  },
  {
    id: "WALLET",
    title: "Wallets",
    subtitle: "Paytm, Amazon Pay & more",
    razorpay: true,
  },
  {
    id: "PAYLATER",
    title: "Pay Later",
    subtitle: "Simpl, LazyPay, ICICI PayLater",
    razorpay: true,
  },
  {
    id: "EMI",
    title: "EMI",
    subtitle: "Credit card EMI options",
    razorpay: true,
  },
  {
    id: "COD",
    title: "Cash on Delivery",
    subtitle: "Pay when you receive",
    razorpay: false,
  },
];

interface CheckoutPaymentSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  isCODAvailable: boolean;
  onPaymentMethodChange: (method: PaymentMethodType) => void;
}

export function CheckoutPaymentSection({
  isOpen,
  onToggle,
  isCODAvailable,
  onPaymentMethodChange,
}: CheckoutPaymentSectionProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("UPI");

  useEffect(() => {
    if (!isCODAvailable && paymentMethod === "COD") {
      setPaymentMethod("UPI");
      onPaymentMethodChange("UPI");
    }
  }, [isCODAvailable, onPaymentMethodChange, paymentMethod]);

  const selectedPaymentLabel =
    PAYMENT_METHODS.find((method) => method.id === paymentMethod)?.title ?? "UPI";

  const handlePaymentMethodChange = (method: PaymentMethodType) => {
    setPaymentMethod(method);
    onPaymentMethodChange(method);
  };

  return (
    <CheckoutAccordionCard
      id="payment"
      title="Payment Method"
      icon={<CreditCard className="w-3.5 h-3.5 text-white" />}
      badge={selectedPaymentLabel}
      isDone
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-2">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = paymentMethod === method.id;
          const isCOD = method.id === "COD";
          const isDisabled = isCOD && !isCODAvailable;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => {
                if (!isDisabled) handlePaymentMethodChange(method.id);
              }}
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={`w-full text-left border rounded-xl p-3 transition ${
                isSelected
                  ? "border-black bg-gray-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-400"
              } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "border-black bg-black" : "border-gray-300"
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                </span>
                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-gray-700" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">
                      {method.title}
                    </span>
                    {method.recommended && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {method.subtitle}
                  </span>
                  <PaymentLogos type={method.id} />
                  {method.razorpay && (
                    <span className="block text-[10px] text-gray-400 mt-0.5">
                      Secured by Razorpay
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </CheckoutAccordionCard>
  );
}
