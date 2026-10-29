"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  CreditCard,
  Truck,
  Lock,
  Plus,
  Check,
  Edit2,
  Trash2,
  Zap,
  Gift,
  X,
  Percent,
  ChevronDown,
  Loader2,
  Info,
  Star,
  Phone,
  AlertCircle,
  PackageX,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAuthModal } from "@/store/useAuthModalStore";
import { toast } from "@/store/useToastStore";
import AddressModal from "@/components/addressModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressApi, type Address } from "@/lib/api/addresses.api";
import {
  CreateOrderDTO,
  orderApi,
  type PaymentMethodType,
  type CourierPreference,
} from "@/lib/api/order.api";
import {
  useCreateOrder,
  useInitiatePayment,
  useVerifyPayment,
} from "@/hooks/useOrders";
import { couponApi, type Coupon } from "@/lib/api/coupon.api";
import { cartApi } from "@/lib/api/cart.api";
import { getCartItemStockQty as getCheckoutStockQty } from "@/lib/utils/cartStock";
import { shippingApi } from "@/lib/api/shipping.api";
import confetti from "canvas-confetti";
import PaymentLogos from "./paymentLogos";
import { extractVariantAttributes } from "@/lib/utils/variant.utils";
import CheckoutLoadingState from "@/components/checkoutLoadingState";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const normalizeAttributes = (attrs: any) => {
  if (!attrs) return [];
  if (typeof attrs === "object" && !Array.isArray(attrs)) {
    return Object.entries(attrs).map(([key, value]) => ({
      key: String(key),
      value: String(value),
    }));
  }
  if (Array.isArray(attrs)) {
    return attrs
      .filter((a) => a?.key && a?.value)
      .map((a) => ({ key: String(a.key), value: String(a.value) }));
  }
  if (typeof attrs === "string") {
    try {
      const parsed = JSON.parse(attrs);
      return normalizeAttributes(parsed);
    } catch {
      return [];
    }
  }
  return [];
};

const getCheckoutItemIssue = (item: any): string | null => {
  if (!item || typeof item !== "object") {
    return "This cart entry is invalid. Remove it and add the product again.";
  }

  const product = item.product;
  const productId = item.productId;
  if (
    productId === undefined ||
    productId === null ||
    !String(productId).trim()
  ) {
    return "The product reference is missing. Remove this item and add the product again.";
  }
  if (
    !product ||
    typeof product !== "object" ||
    product.id === undefined ||
    product.id === null
  ) {
    return "Product details are no longer available. Remove this item and add it again.";
  }
  if (String(product.id) !== String(productId)) {
    return "The product details do not match this cart item. Remove it and add the product again.";
  }
  if (product.isActive === false) {
    return "This product is no longer available for purchase. Remove it from your cart.";
  }
  if (typeof product.name !== "string" || !product.name.trim()) {
    return "The product name is missing. Remove this item and add the product again.";
  }

  if (
    item.variantId &&
    (!item.variant || String(item.variant.id) !== String(item.variantId))
  ) {
    return "The selected variant is no longer available. Remove this item and select a variant again.";
  }
  if (product.hasVariants === true && !item.variantId) {
    return "A variant must be selected before checkout. Return to the product page and choose an option.";
  }

  const quantity = Number(item.quantity);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return "The quantity is invalid. Remove this item and add it again.";
  }

  const price = Number(
    item.variant?.sellingPrice ??
      item.variant?.price ??
      product.sellingPrice ??
      item.price ??
      Number.NaN,
  );
  if (!Number.isFinite(price) || price <= 0) {
    return "The price could not be verified. Remove this item and add the product again.";
  }

  return null;
};

// ─── Accordion Section Component ─────────────────────────────────────────────
type AccordionSection = "items" | "address" | "courier" | "payment";

interface AccordionProps {
  id: AccordionSection;
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isDone?: boolean;
}

const AccordionCard = ({
  title,
  icon,
  badge,
  isOpen,
  onToggle,
  children,
  isDone,
}: AccordionProps) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-2.5">
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-gray-50 transition text-left"
    >
      <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="font-bold text-gray-900 text-sm flex-1">{title}</span>
      {badge && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${
            isDone
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-gray-100 text-gray-500 border-gray-200"
          }`}
        >
          {isDone && <Check className="w-3 h-3" />}
          {badge}
        </span>
      )}
      <ChevronDown
        className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden border-t border-gray-100"
        >
          <div className="p-3">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── Processing Overlay ────────────────────────────────────────────────────────
const ProcessingOverlay = ({ step }: { step: 1 | 2 | 3 }) => {
  const steps = ["Creating Order", "Initiating Payment", "Verifying Payment"];
  return (
    <div className="fixed inset-0 z-[9999] bg-white/5 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-[320px]">
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-900">
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">
              Processing your order
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Please don't refresh or close this page
            </p>
          </div>
          <div className="w-full space-y-2 mt-2">
            {steps.map((label, index) => {
              const current = index + 1;
              return (
                <div key={label} className="flex items-center gap-2 text-sm">
                  {current < step && (
                    <Check
                      className="h-4 w-4 text-green-600"
                      aria-hidden="true"
                    />
                  )}
                  {current === step && (
                    <Loader2
                      className="h-4 w-4 animate-spin text-stone-900"
                      aria-hidden="true"
                    />
                  )}
                  {current > step && (
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-gray-300"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={
                      current <= step
                        ? "text-gray-900 font-medium"
                        : "text-gray-400"
                    }
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Order Success Overlay ────────────────────────────────────────────────────
const OrderSuccessOverlay = () => (
  <div className="fixed inset-0 z-[10000] bg-white/5 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-[320px] text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <p className="text-lg font-bold text-gray-900">Order Confirmed</p>
      <p className="text-sm text-gray-500 mt-1">
        Redirecting to success page...
      </p>
      <div className="flex justify-center gap-1 mt-4">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.2s]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.4s]" />
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CheckoutClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const isBuyNowMode = searchParams.get("mode") === "buyNow";
  const [couponErrorMsg, setCouponErrorMsg] = useState("");

  const { user, openModal } = useAuthModal();
  const {
    items: cartItems,
    appliedCoupon,
    clearCart,
    applyCoupon,
    removeCoupon,
    removeItem,
    updateQuantity,
  } = useCartStore();

  const [isCartHydrated, setIsCartHydrated] = useState(false);
  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      setIsCartHydrated(true);
      return;
    }
    return useCartStore.persist.onFinishHydration(() =>
      setIsCartHydrated(true),
    );
  }, []);

  // ─── Accordion State ──────────────────────────────────────────────────────
  const [openSections, setOpenSections] = useState<
    Record<AccordionSection, boolean>
  >({
    items: true,
    address: true,
    courier: false,
    payment: true,
  });

  const toggleSection = (section: AccordionSection) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<any>(null);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [courierPreference, setCourierPreference] =
    useState<CourierPreference>("CHEAPEST");
  const [showAllCouriers, setShowAllCouriers] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [processingStep, setProcessingStep] = useState<1 | 2 | 3>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isPaymentHandledRef = useRef(false);

  const handleSuccessfulOrderCleanup = async () => {
    if (!isBuyNowMode) {
      clearCart();
      if (user) {
        try {
          await cartApi.clearCart();
        } catch (err) {
          console.warn("Failed to clear cart on server:", err);
        }
        queryClient.setQueryData(["cartApi", user.id], {
          items: [],
          totalItems: 0,
          subtotal: 0,
        });
        await queryClient.invalidateQueries({ queryKey: ["cartApi"] });
      }
    } else {
      sessionStorage.removeItem("buyNowItem");
    }
  };

  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();
  const initiatePaymentMutation = useInitiatePayment();

  const fireConfetti = () => {
    const duration = 1500;
    const animationEnd = Date.now() + duration;
    const interval = setInterval(() => {
      if (Date.now() > animationEnd) {
        clearInterval(interval);
        return;
      }
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
      });
    }, 200);
  };

  useEffect(() => {
    if (showSuccess) fireConfetti();
  }, [showSuccess]);

  // Open courier section automatically when address is selected
  useEffect(() => {
    if (selectedAddress) {
      setOpenSections((prev) => ({ ...prev, courier: true }));
    }
  }, [selectedAddress?.id]);

  const paymentMethods = [
    {
      id: "UPI" as PaymentMethodType,
      title: "UPI",
      subtitle: "Google Pay, PhonePe, Paytm & more",
      icon: "upi",
      recommended: true,
      razorpay: true,
    },
    {
      id: "CARD" as PaymentMethodType,
      title: "Credit / Debit Card",
      subtitle: "Visa, Mastercard, RuPay",
      icon: "card",
      razorpay: true,
    },
    {
      id: "NETBANKING" as PaymentMethodType,
      title: "Net Banking",
      subtitle: "All major banks",
      icon: "bank",
      razorpay: true,
    },
    {
      id: "WALLET" as PaymentMethodType,
      title: "Wallets",
      subtitle: "Paytm, Amazon Pay & more",
      icon: "wallet",
      razorpay: true,
    },
    {
      id: "PAYLATER" as PaymentMethodType,
      title: "Pay Later",
      subtitle: "Simpl, LazyPay, ICICI PayLater",
      icon: "paylater",
      razorpay: true,
    },
    {
      id: "EMI" as PaymentMethodType,
      title: "EMI",
      subtitle: "Credit card EMI options",
      icon: "emi",
      razorpay: true,
    },
    {
      id: "COD" as PaymentMethodType,
      title: "Cash on Delivery",
      subtitle: "Pay when you receive",
      icon: "cod",
      razorpay: false,
    },
  ];

  useEffect(() => {
    if (isBuyNowMode) {
      const storedItem = sessionStorage.getItem("buyNowItem");
      if (storedItem) {
        try {
          setBuyNowItem(JSON.parse(storedItem));
        } catch {
          router.push("/cart");
        }
      } else {
        router.push("/cart");
      }
    }
  }, [isBuyNowMode, router]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const { data: addressesData, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => (await addressApi.getAddresses()).data,
    enabled: !!user,
  });

  const { data: cartData, isLoading: isLoadingCartApi } = useQuery({
    queryKey: ["cartApi", user?.id],
    queryFn: async () => (await cartApi.getCart()).data,
    enabled: !!user,
    staleTime: 0,
  });

  const apiItems = cartData?.items ?? [];
  const displayItems = isBuyNowMode
    ? buyNowItem
      ? [buyNowItem]
      : []
    : user
      ? apiItems
      : cartItems;
  const invalidCartItems = displayItems
    .map((item: any, index: number) => {
      const productIssue = getCheckoutItemIssue(item);
      const stockQty = getCheckoutStockQty(item);
      const quantity = Number(item?.quantity);
      const stockIssue =
        !productIssue &&
        quantity > stockQty &&
        item?.product?.allowOutOfStockOrders !== true
          ? `${item?.product?.name || "This product"} has only ${stockQty} item(s) available. Reduce the quantity or remove it.`
          : null;
      return { item, index, message: productIssue ?? stockIssue };
    })
    .filter((entry: { message: string | null }) => entry.message !== null);
  const isCheckoutInitializing =
    !isCartHydrated ||
    (!!user && isLoadingCartApi) ||
    (isBuyNowMode && !buyNowItem);
  const addresses = addressesData || [];

  const shippingCartSignature = useMemo(
    () =>
      displayItems
        .map((item: any) =>
          [
            item?.productId ?? item?.product?.id ?? "missing",
            item?.variantId ?? item?.variant?.id ?? "simple",
            item?.quantity ?? "invalid",
          ].join(":"),
        )
        .sort()
        .join("|"),
    [displayItems],
  );

  const { data: shippingData, isLoading: isLoadingShipping } = useQuery({
    queryKey: ["cartShipping", selectedAddress?.pincode, shippingCartSignature],
    queryFn: async () => {
      if (
        !selectedAddress?.pincode ||
        displayItems.length === 0 ||
        invalidCartItems.length > 0
      )
        return null;
      const response = await shippingApi.getCartShippingRates({
        deliveryPincode: selectedAddress?.pincode,
        selectedCourierCompanyId: selectedCourier?.courier_company_id,
        cartItems: displayItems.map((item: any) => ({
          productId: item.productId ?? item.product?.id,
          ...((item.variantId ?? item.variant?.id)
            ? { variantId: item.variantId ?? item.variant?.id }
            : {}),
          quantity: Number(item.quantity),
        })),
      });
      return response.data;
    },
    enabled:
      !!selectedAddress?.pincode &&
      displayItems.length > 0 &&
      invalidCartItems.length === 0,
    staleTime: 0,
  });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((addr) => addr.isDefault);
      setSelectedAddress(defaultAddr || addresses[0]);
    }
  }, [addresses, selectedAddress]);

  const {
    data: orderPreview,
    isLoading: isLoadingPreview,
    refetch: refetchPreview,
    isError: isErrorOrderPreview,
  } = useQuery({
    queryKey: [
      "orderPreview",
      selectedAddress?.id,
      selectedCourier?.courier_company_id,
      appliedCoupon?.code,
      buyNowItem?.productId,
      buyNowItem?.variantId,
      buyNowItem?.quantity,
      displayItems
        .map(
          (item: any) =>
            `${item?.productId ?? item?.product?.id ?? "missing"}:${item?.variantId ?? item?.variant?.id ?? "simple"}:${item?.quantity ?? "invalid"}`,
        )
        .join(","),
    ],
    queryFn: async () => {
      if (
        !selectedAddress ||
        displayItems.length === 0 ||
        invalidCartItems.length > 0
      )
        return null;
      const orderItems =
        isBuyNowMode && buyNowItem
          ? [
              {
                productId: buyNowItem.productId,
                variantId: buyNowItem.variantId,
                quantity: buyNowItem.quantity,
              },
            ]
          : undefined;
      const response = await orderApi.getOrderPreview({
        shippingAddressId: selectedAddress.id,
        couponCode: appliedCoupon?.code,
        items: orderItems,
        selectedCourierCompanyId: selectedCourier?.courier_company_id,
      });
      return response.data;
    },
    enabled:
      !!selectedAddress &&
      !!selectedCourier &&
      displayItems.length > 0 &&
      invalidCartItems.length === 0,
    staleTime: 0,
    gcTime: 0,
  });

  const subtotal = orderPreview?.breakdown.subtotal || 0;
  const discount = orderPreview?.breakdown.discount || 0;
  const couponDiscount = orderPreview?.breakdown.couponDiscount || 0;
  // const shippingCost = orderPreview?.breakdown.shippingCost || 0;
  const shippingCost = Number(
    selectedCourier?.freight_charge ??
      orderPreview?.breakdown?.shippingCost ??
      0,
  );
  const taxableAmount = subtotal - couponDiscount + shippingCost;

  const cgstAmount = taxableAmount * 0.025;
  const sgstAmount = taxableAmount * 0.025;

  const gstAmount = cgstAmount + sgstAmount;

  const availableCouriers = shippingData?.availableCouriers ?? [];
  const cheapestCourier = shippingData?.cheapestCourier;
  const fastestCourier = shippingData?.fastestCourier;
  const chargeableWeight = shippingData?.chargeableWeight || 0;
  const isServiceable = shippingData?.serviceable ?? true;
  const isFreeShipping = shippingData?.isFreeShipping ?? shippingCost === 0;
  const total = taxableAmount + gstAmount;
  const estimatedDelivery = orderPreview?.estimatedDelivery || "3-5 days";
  const couponError = orderPreview?.couponError;
  const isCODAvailable = total > 0 && total <= 2000;

  const eligibleCouriers = useMemo(() => {
    if (!availableCouriers || availableCouriers.length === 0) return [];
    return availableCouriers.filter((courier: any) => {
      const courierName = courier.courier_name?.toLowerCase() || "";
      if (courierName.includes("amazon") && courierName.includes("1kg"))
        return chargeableWeight <= 1;
      return true;
    });
  }, [availableCouriers, chargeableWeight]);

  useEffect(() => {
    if (!shippingData) return;
    const couriers = shippingData.availableCouriers || [];
    if (couriers.length === 0) {
      setSelectedCourier(null);
      return;
    }

    const currentCourier = selectedCourier
      ? couriers.find(
          (courier: any) =>
            Number(courier.courier_company_id) ===
            Number(selectedCourier.courier_company_id),
        )
      : null;

    if (currentCourier) {
      setSelectedCourier(currentCourier);
      return;
    }

    const cheapest =
      couriers.find(
        (courier: any) =>
          Number(courier.courier_company_id) ===
          Number(shippingData.cheapestCourier?.courier_company_id),
      ) ??
      couriers.reduce((min: any, curr: any) =>
        curr.freight_charge < min.freight_charge ? curr : min,
      );
    setSelectedCourier(cheapest);
    setCourierPreference("CHEAPEST");
  }, [shippingData, selectedCourier]);

  const getStockQty = (item: any) => getCheckoutStockQty(item);

  const getUnitPrice = (item: any) =>
    Number(
      item?.variant?.sellingPrice ??
        item?.variant?.price ??
        item?.product?.sellingPrice ??
        item?.price ??
        Number.NaN,
    );

  const {
    data: applicableCouponsData,
    isLoading: isLoadingCoupons,
    refetch: refetchCoupons,
  } = useQuery({
    queryKey: [
      "applicableCoupons",
      subtotal,
      displayItems.length,
      shippingCartSignature,
    ],
    queryFn: async () => {
      if (
        !user ||
        displayItems.length === 0 ||
        invalidCartItems.length > 0 ||
        !orderPreview ||
        subtotal <= 0
      )
        return { data: [] };
      const cartItems = displayItems.map((item: any) => ({
        productId: item.productId,
        categoryId: item.categoryId,
        quantity: item.quantity,
        price: getUnitPrice(item),
      }));
      return await couponApi.getApplicableCoupons({
        orderAmount: subtotal,
        cartItems,
      });
    },
    enabled:
      !!user &&
      displayItems.length > 0 &&
      invalidCartItems.length === 0 &&
      !!orderPreview &&
      subtotal > 0,
  });

  const availableCoupons = useMemo(
    () => applicableCouponsData?.data ?? [],
    [applicableCouponsData?.data],
  );
  const filteredCoupons = couponCode
    ? availableCoupons.filter((coupon) =>
        coupon.code.toLowerCase().includes(couponCode.toLowerCase()),
      )
    : availableCoupons;

  useEffect(() => {
    setShowAutocomplete(!!couponCode && filteredCoupons.length > 0);
  }, [couponCode, filteredCoupons.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
        setShowCouponDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateQtyMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => await cartApi.updateCartItem(itemId, { quantity }),
    onMutate: async ({ itemId, quantity }) => {
      const queryKey = ["cartApi", user?.id];
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData<any>(queryKey);
      if (previousCart?.items) {
        const target = previousCart.items.find(
          (item: any) => String(item.id) === String(itemId),
        );
        let items = previousCart.items;
        if (target) {
          const productId = String(
            target.productId ?? target.product?.id ?? "",
          );
          const variantId = String(
            target.variantId ?? target.variant?.id ?? "",
          );
          let kept = false;
          items = previousCart.items.flatMap((item: any) => {
            const sameLine =
              String(item.productId ?? item.product?.id ?? "") === productId &&
              String(item.variantId ?? item.variant?.id ?? "") === variantId;
            if (!sameLine) return [item];
            if (kept) return [];
            kept = true;
            return [{ ...item, quantity }];
          });
        }
        const subtotal = items.reduce((sum: number, item: any) => {
          const price = Number(
            item.variant?.sellingPrice ??
              item.variant?.price ??
              item.product?.sellingPrice ??
              0,
          );
          return sum + price * Number(item.quantity || 0);
        }, 0);
        queryClient.setQueryData(queryKey, {
          ...previousCart,
          items,
          totalItems: items.reduce(
            (sum: number, item: any) => sum + Number(item.quantity || 0),
            0,
          ),
          subtotal,
        });
      }
      return { previousCart, queryKey };
    },
    onError: (err: any, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(context.queryKey, context.previousCart);
      }
      toast.error(err?.message || "Failed to update quantity");
    },
    onSettled: () => {
      // The new cart signature selects fresh shipping/order-preview/coupon
      // query keys. Only sync the canonical cart here to avoid duplicate calls.
      queryClient.invalidateQueries({ queryKey: ["cartApi", user?.id] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => await cartApi.removeFromCart(itemId),
    onMutate: async (itemId) => {
      const queryKey = ["cartApi", user?.id];
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData<any>(queryKey);
      if (previousCart?.items) {
        const target = previousCart.items.find(
          (item: any) => String(item.id) === String(itemId),
        );
        if (target) {
          const productId = String(
            target.productId ?? target.product?.id ?? "",
          );
          const variantId = String(
            target.variantId ?? target.variant?.id ?? "",
          );
          const items = previousCart.items.filter(
            (item: any) =>
              String(item.productId ?? item.product?.id ?? "") !== productId ||
              String(item.variantId ?? item.variant?.id ?? "") !== variantId,
          );
          const subtotal = items.reduce((sum: number, item: any) => {
            const price = Number(
              item.variant?.sellingPrice ??
                item.variant?.price ??
                item.product?.sellingPrice ??
                0,
            );
            return sum + price * Number(item.quantity || 0);
          }, 0);
          queryClient.setQueryData(queryKey, {
            ...previousCart,
            items,
            totalItems: items.reduce(
              (sum: number, item: any) => sum + Number(item.quantity || 0),
              0,
            ),
            subtotal,
          });
        }
      }
      return { previousCart, queryKey };
    },
    onSuccess: () => {
      toast.success("Item removed");
    },
    onError: (err: any, _itemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(context.queryKey, context.previousCart);
      }
      toast.error(err?.message || "Failed to remove item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cartApi", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["orderPreview"] });
      queryClient.invalidateQueries({ queryKey: ["applicableCoupons"] });
    },
  });

  const handleRemoveCheckoutItem = (item: any) => {
    if (isBuyNowMode) {
      sessionStorage.removeItem("buyNowItem");
      setBuyNowItem(null);
      router.push("/cart");
      return;
    }

    if (user?.id) {
      if (
        item?.id === undefined ||
        item?.id === null ||
        String(item.id).trim() === ""
      ) {
        toast.error(
          "Unable to remove this item. Please refresh your cart and try again.",
        );
        return;
      }
      removeItemMutation.mutate(String(item.id));
      return;
    }

    if (item?.id !== undefined && item?.id !== null) {
      removeItem(String(item.id));
      return;
    }

    toast.error(
      "Unable to remove this item. Please refresh your cart and try again.",
    );
  };

  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const cartItemsForValidation = displayItems.map((item: any) => ({
        productId: item.productId,
        categoryId: item.categoryId,
        quantity: item.quantity,
        price: getUnitPrice(item),
      }));
      return await couponApi.validateCoupon({
        code: code.toUpperCase(),
        orderAmount: subtotal,
        cartItems: cartItemsForValidation,
      });
    },
    onSuccess: async (response, code) => {
      console.log("coupon response", response);

      // ✅ Handle invalid structure safely
      if (!response?.success) {
        const errorMsg = response?.message || "Invalid coupon code";
        toast.error(errorMsg);
        setCouponErrorMsg(errorMsg);
        return;
      }

      const payload = response.data;

      // ✅ Extra safety check
      if (!payload || !payload.valid) {
        const errorMsg = payload?.message || "Invalid coupon code";
        toast.error(errorMsg);
        setCouponErrorMsg(errorMsg);
        return;
      }

      // ✅ SUCCESS FLOW
      setCouponErrorMsg("");

      applyCoupon({
        code: payload.coupon.code,
        discountType: payload.coupon.discountType,
        discountValue: payload.coupon.discountValue,
        minOrderValue: payload.coupon.minOrderValue,
        maxDiscountAmount: payload.coupon.maxDiscountAmount,
        validFrom: payload.coupon.validFrom,
        validUntil: payload.coupon.validUntil,
        isActive: payload.coupon.isActive,
        discountAmount: payload.discount,
        finalAmount: payload.finalAmount || 0,
      });

      setCouponCode("");
      setShowCouponDropdown(false);
      setShowAutocomplete(false);

      await queryClient.invalidateQueries({
        queryKey: ["orderPreview"],
        exact: false,
      });

      await refetchPreview();

      toast.success(
        `Coupon "${code}" applied! You save ₹${Number(payload.discount).toFixed(2)}`,
      );

      refetchCoupons();
    },
    onError: (error: any) => {
      console.log("error", error);

      (toast.error(error.message || "Failed to apply coupon"),
        setCouponErrorMsg(error.message || "Invalid coupon code"));
    },
  });

  const handleApplyCoupon = (code: string) => {
    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    validateCouponMutation.mutate(code);
  };

  const handleRemoveCoupon = async () => {
    removeCoupon();
    await queryClient.invalidateQueries({ queryKey: ["orderPreview"] });
    await refetchCoupons();
    toast.info("Coupon removed");
  };

  const handleCouponSelect = (coupon: Coupon) => {
    setCouponCode(coupon.code);
    setShowAutocomplete(false);
    handleApplyCoupon(coupon.code);
  };

  const deleteAddressMutation = useMutation({
    mutationFn: addressApi.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted");
    },
    onError: () => toast.error("Failed to delete address"),
  });

  const handleAddressSelect = (address: Address) => setSelectedAddress(address);
  const handleAddNewAddress = () => {
    if (!user) {
      openModal("login");
      return;
    }
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };
  const handleDeleteAddress = (addressId: string) => {
    if (selectedAddress?.id === addressId) setSelectedAddress(null);
    deleteAddressMutation.mutate(addressId);
  };

  const handleCourierSelect = async (
    courier: any,
    preference: CourierPreference,
  ) => {
    setSelectedCourier(courier);
    setCourierPreference(preference);

    await queryClient.invalidateQueries({
      queryKey: ["orderPreview"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["cartShipping"],
    });
  };

  const getRazorpayBlock = (method: PaymentMethodType) => {
    switch (method) {
      case "UPI":
        return "block.upi";
      case "CARD":
        return "block.card";
      case "NETBANKING":
        return "block.netbanking";
      case "WALLET":
        return "block.wallet";
      case "EMI":
        return "block.emi";
      case "PAYLATER":
        return "block.paylater";
      default:
        return "block.upi";
    }
  };

  const handleRazorpayPayment = async (orderData: any) => {
    try {
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amountInPaise,
        currency: "INR",
        name: "Kankana Silks",
        description: "Order Payment",
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
          contact: selectedAddress?.phone,
        },
        notes: {
          address: `${selectedAddress?.addressLine1}, ${selectedAddress?.city}`,
        },
        config: {
          display: {
            blocks: {
              upi: { name: "UPI", instruments: [{ method: "upi" }] },
              card: { name: "Cards", instruments: [{ method: "card" }] },
              netbanking: {
                name: "Net Banking",
                instruments: [{ method: "netbanking" }],
              },
              wallet: { name: "Wallet", instruments: [{ method: "wallet" }] },
              emi: { name: "EMI", instruments: [{ method: "emi" }] },
              paylater: {
                name: "Pay Later",
                instruments: [{ method: "paylater" }],
              },
            },
            sequence: [getRazorpayBlock(paymentMethod)],
            preferences: { show_default_blocks: true },
          },
        },
        theme: { color: "#000000" },
        handler: async function (response: any) {
          if (isPaymentHandledRef.current) return;
          isPaymentHandledRef.current = true;

          try {
            setProcessingStep(3);
            const result = await verifyPaymentMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await handleSuccessfulOrderCleanup();
            setIsProcessing(false);
            setShowSuccess(true);
            setTimeout(() => {
              router.push(
                `/order-success?orderId=${result.data.id}&orderNumber=${result.data.orderNumber}`,
              );
            }, 1800);
          } catch (error) {
            isPaymentHandledRef.current = false;
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
            setIsProcessing(false);
          },
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      toast.error("Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (displayItems.length === 0) {
      toast.error("Your cart is empty.");
      router.push("/cart");
      return;
    }
    if (invalidCartItems.length > 0) {
      setOpenSections((previous) => ({ ...previous, items: true }));
      toast.error(
        invalidCartItems[0].message ||
          "Remove invalid cart items before checkout.",
      );
      return;
    }
    if (!user) {
      toast.error("Please login to place order");
      openModal("login");
      return;
    }
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }
    if (!selectedCourier) {
      toast.error("Please select a courier");
      return;
    }
    // ✅ STOCK VALIDATION (ADD HERE)
    const invalidItem = displayItems.find(
      (item: any) =>
        Number(item.quantity) > getStockQty(item) &&
        item.product?.allowOutOfStockOrders !== true,
    );

    if (invalidItem) {
      toast.error(`${invalidItem.product?.name} exceeds available stock`);
      return;
    }
    if (paymentMethod === "COD" && !isCODAvailable) {
      toast.error("COD is only available for orders up to ₹2,000");
      return;
    }
    try {
      setIsProcessing(true);
      setProcessingStep(1);
      const orderDTO: CreateOrderDTO = {
        shippingAddressId: selectedAddress.id,
        billingAddressId: selectedAddress.id,
        couponCode: appliedCoupon?.code,
        paymentMethod: paymentMethod,
        courierPreference: courierPreference,
        selectedCourierCompanyId: selectedCourier.courier_company_id,
        ...(isBuyNowMode && buyNowItem
          ? {
              items: [
                {
                  productId: buyNowItem.productId,
                  variantId: buyNowItem.variantId || undefined,
                  quantity: buyNowItem.quantity,
                },
              ],
            }
          : {}),
      };
      const response = await initiatePaymentMutation.mutateAsync(orderDTO);
      setProcessingStep(2);
      if (paymentMethod === "COD") {
        await handleSuccessfulOrderCleanup();
        setProcessingStep(3);
        setIsProcessing(false);
        setShowSuccess(true);
        setTimeout(() => {
          router.push("/order-success");
        }, 1500);
        return;
      } else {
        await handleRazorpayPayment({
          razorpayOrderId: response.data.razorpayOrderId,
          razorpayKeyId: response.data.razorpayKeyId,
          amountInPaise: response.data.amountInPaise,
        });
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast.error(error.message || "Failed to place order");
      setIsProcessing(false);
    }
  };

  const formatMoney = (value: number) => `₹${Number(value || 0).toFixed(2)}`;

  if (isCheckoutInitializing) return <CheckoutLoadingState />;

  if (displayItems.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#faf9f6] px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-700">
            <PackageX className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-stone-950">
            Your checkout is empty
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Add an available product to your cart before continuing to checkout.
          </p>
          <Link
            href="/cart"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            <ArrowLeft className="h-4 w-4" /> Return to cart
          </Link>
        </div>
      </main>
    );
  }

  // ─── Badge helpers ────────────────────────────────────────────────────────
  const itemsBadge = `${displayItems.length} item${displayItems.length !== 1 ? "s" : ""}`;
  const addressBadge = selectedAddress
    ? selectedAddress.fullName
    : "Not selected";
  const courierBadge = selectedCourier
    ? selectedCourier.courier_name
    : "Not selected";
  const paymentBadge =
    paymentMethods.find((m) => m.id === paymentMethod)?.title || "UPI";

  return (
    <>
      {isProcessing && <ProcessingOverlay step={processingStep} />}
      {showSuccess && <OrderSuccessOverlay />}

      <div className="h-screen overflow-auto bg-gray-50 flex flex-col">
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <div className="flex-none bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/cart">
                <motion.button
                  whileHover={{ x: -3 }}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Cart</span>
                </motion.button>
              </Link>
              <div className="h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
                {isBuyNowMode && (
                  <span className="text-xs bg-main-primary text-main-secondary border border-main-primary/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Express
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>

        {/* ─── Body ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid lg:grid-cols-5 gap-4">
              {/* ── Left: Accordions (3/5) ───────────────────────────────── */}
              <div className="lg:col-span-3">
                {/* 1. Order Items */}
                <AccordionCard
                  id="items"
                  title={`Order Items (${displayItems.length})`}
                  icon={<ShoppingBag className="w-3.5 h-3.5 text-white" />}
                  badge={itemsBadge}
                  isDone={displayItems.length > 0}
                  isOpen={openSections.items}
                  onToggle={() => toggleSection("items")}
                >
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {invalidCartItems.length > 0 && (
                      <div
                        role="alert"
                        className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          <p className="font-semibold">
                            Some items need attention before checkout
                          </p>
                          <p className="mt-1">
                            One or more products have missing details, an
                            invalid price or variant, or a quantity above
                            available stock. Remove unavailable items or reduce
                            their quantity before continuing.
                          </p>
                        </div>
                      </div>
                    )}
                    {displayItems.map((item: any, index: number) => {
                      const stockQty = getStockQty(item);
                      const unitPrice = getUnitPrice(item);
                      const validationIssue = invalidCartItems.find(
                        (entry: { index: number; message: string }) =>
                          entry.index === index,
                      )?.message;
                      const itemName =
                        (typeof item?.product?.name === "string"
                          ? item.product.name.trim()
                          : "") ||
                        (typeof item?.name === "string"
                          ? item.name.trim()
                          : "") ||
                        "Unavailable product";

                      return (
                        <div
                          key={`${item?.productId ?? "missing"}-${item?.variantId ?? "default"}-${index}`}
                          className="flex gap-2.5 p-2.5 bg-gray-50 rounded-lg relative"
                        >
                          <button
                            type="button"
                            aria-label={`Remove ${itemName} from checkout`}
                            onClick={() => handleRemoveCheckoutItem(item)}
                            disabled={removeItemMutation.isPending}
                            aria-busy={removeItemMutation.isPending}
                            className="absolute top-2 right-2 p-1 hover:bg-red-50 rounded transition disabled:cursor-wait disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>

                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item?.product?.media?.[0]?.url ? (
                              <Image
                                src={item.product.media[0].url}
                                alt={itemName}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <p className="font-semibold text-gray-900 text-xs line-clamp-1">
                              {itemName}
                            </p>
                            {validationIssue && (
                              <p
                                role="alert"
                                className="mt-1 text-[10px] leading-4 text-red-700"
                              >
                                {validationIssue} Remove this item and add the
                                product again before continuing.
                              </p>
                            )}
                            {(() => {
                              const variantAttrs = extractVariantAttributes(
                                item?.variant,
                              );
                              if (variantAttrs.length === 0) return null;
                              return (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {variantAttrs.map(({ key, value }) => (
                                    <span
                                      key={key}
                                      className="text-xs bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600"
                                    >
                                      {key}: <b>{value}</b>
                                    </span>
                                  ))}
                                </div>
                              );
                            })()}
                            {stockQty > 0 && stockQty <= 5 && (
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 rounded">
                                  <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                                  Only {stockQty} left in stock
                                </span>
                              </div>
                            )}

                            {stockQty === 0 && (
                              <div className="mt-1">
                                <span className="inline-flex items-center text-[10px] font-medium text-red-700 bg-red-50 border border-red-200/70 px-1.5 py-0.5 rounded">
                                  Out of stock
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-1.5 py-0.5">
                                <button
                                  disabled={
                                    isBuyNowMode ||
                                    updateQtyMutation.isPending ||
                                    Number(item?.quantity) <= 1
                                  }
                                  onClick={() => {
                                    if (item.quantity <= 1 || isBuyNowMode)
                                      return;
                                    if (user?.id) {
                                      updateQtyMutation.mutate({
                                        itemId: String(item.id),
                                        quantity: item.quantity - 1,
                                      });
                                    } else if (item?.id != null) {
                                      updateQuantity(
                                        String(item.id),
                                        item.quantity - 1,
                                      );
                                    }
                                  }}
                                  className="w-5 h-5 flex items-center justify-center text-gray-600 disabled:opacity-40 text-sm disabled:cursor-not-allowed"
                                >
                                  −
                                </button>
                                <span className="w-5 text-center text-xs font-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  disabled={
                                    isBuyNowMode ||
                                    updateQtyMutation.isPending ||
                                    item?.product?.allowOutOfStockOrders !==
                                      true ||
                                    Number(item?.quantity) >= stockQty
                                  }
                                  onClick={() => {
                                    if (isBuyNowMode) return;
                                    if (
                                      item?.product?.allowOutOfStockOrders !==
                                        true ||
                                      Number(item.quantity) >= stockQty
                                    )
                                      return;
                                    if (user?.id) {
                                      updateQtyMutation.mutate({
                                        itemId: String(item.id),
                                        quantity: item.quantity + 1,
                                      });
                                    } else if (item?.id != null) {
                                      updateQuantity(
                                        String(item.id),
                                        item.quantity + 1,
                                      );
                                    }
                                  }}
                                  className="w-5 h-5 flex items-center justify-center bg-gray-900 text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                                >
                                  +
                                </button>
                              </div>
                              <p className="font-bold text-xs text-gray-900">
                                {Number.isFinite(unitPrice) && unitPrice > 0
                                  ? formatMoney(
                                      unitPrice * Number(item.quantity),
                                    )
                                  : "Price unavailable"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionCard>

                {/* 2. Delivery Address */}
                <AccordionCard
                  id="address"
                  title="Delivery Address"
                  icon={<MapPin className="w-3.5 h-3.5 text-white" />}
                  badge={addressBadge}
                  isDone={!!selectedAddress}
                  isOpen={openSections.address}
                  onToggle={() => toggleSection("address")}
                >
                  {!user ? (
                    <div className="flex items-center justify-between py-2">
                      <p className="text-sm text-gray-500">
                        Login to add delivery address
                      </p>
                      <button
                        onClick={() => openModal("login")}
                        className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-xs font-semibold"
                      >
                        Login
                      </button>
                    </div>
                  ) : isLoadingAddresses ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="p-3 border border-gray-200 rounded-lg animate-pulse"
                        >
                          <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5" />
                          <div className="h-2.5 bg-gray-200 rounded w-full" />
                        </div>
                      ))}
                    </div>
                  ) : addresses.length === 0 ? (
                    <button
                      onClick={handleAddNewAddress}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-900 transition flex items-center justify-center gap-2 text-gray-500 text-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Delivery Address
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            onClick={() => handleAddressSelect(address)}
                            className={`p-2.5 border rounded-lg cursor-pointer transition-all flex items-start gap-2.5 ${selectedAddress?.id === address.id ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}
                          >
                            <div
                              className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedAddress?.id === address.id ? "border-gray-900 bg-gray-900" : "border-gray-300"}`}
                            >
                              {selectedAddress?.id === address.id && (
                                <Check className="w-2.5 h-2.5 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-gray-900 text-xs">
                                  {address.fullName}
                                </p>
                                {address.isDefault && (
                                  <span className="text-xs bg-main-primary text-main-secondary px-1.5 py-0 rounded-full text-[10px]">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {address.addressLine1}
                                {address.addressLine2 &&
                                  `, ${address.addressLine2}`}
                                , {address.city}, {address.state} –{" "}
                                {address.pincode}
                              </p>
                              <p className="text-xs text-gray-500">
                                <span className="flex items-center gap-0.5">
                                  <Phone className="w-3 h-3 text-main-primary" />{" "}
                                  {address.phone}
                                </span>
                              </p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAddress(address);
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition"
                              >
                                <Edit2 className="w-3 h-3 text-gray-500" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(address.id);
                                }}
                                className="p-1 hover:bg-red-50 rounded transition"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={handleAddNewAddress}
                        className="w-full py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-900 transition flex items-center justify-center gap-1.5 text-gray-500 text-xs font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add New Address
                      </button>
                    </div>
                  )}
                </AccordionCard>

                {/* 3. Courier Selection */}
                <AccordionCard
                  id="courier"
                  title="Select Courier"
                  icon={<Truck className="w-3.5 h-3.5 text-white" />}
                  badge={selectedCourier ? courierBadge : "Choose one"}
                  isDone={!!selectedCourier}
                  isOpen={openSections.courier}
                  onToggle={() => toggleSection("courier")}
                >
                  {!selectedAddress ? (
                    <p className="text-xs text-gray-400 py-1">
                      Select an address first to see courier options.
                    </p>
                  ) : isLoadingShipping ? (
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Fetching courier rates...
                      </span>
                    </div>
                  ) : eligibleCouriers.length === 0 ? (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                      No courier available for this pincode.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* {chargeableWeight > 0 && (
                        <div className="text-[10px] bg-main-primary border border-main-primary rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-main-secondary">
                          <Info className="w-3 h-3 flex-shrink-0" />
                          Chargeable Weight:{" "}
                          <span className="font-bold">
                            {chargeableWeight.toFixed(2)} kg
                          </span>
                        </div>
                      )} */}

                      {cheapestCourier && (
                        <div
                          onClick={() =>
                            handleCourierSelect(cheapestCourier, "CHEAPEST")
                          }
                          className={`p-2.5 border rounded-lg cursor-pointer transition-all ${selectedCourier?.courier_company_id === cheapestCourier.courier_company_id ? "bg-main-primary/10 border-main-primary" : ""}`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedCourier?.courier_company_id === cheapestCourier.courier_company_id ? "border-main-primary bg-main-primary" : "border-gray-300"}`}
                            >
                              {selectedCourier?.courier_company_id ===
                                cheapestCourier.courier_company_id && (
                                <Check className="w-2.5 h-2.5 text-main-secondary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] bg-main-secondary text-main-primary px-1.5 py-0 rounded-full font-bold">
                                    AFFORDABLE
                                  </span>
                                  <p className="font-semibold text-gray-900 text-xs mt-0.5">
                                    {cheapestCourier.courier_name}
                                  </p>
                                </div>
                                <p className="font-bold text-main-primary text-sm">
                                  {formatMoney(cheapestCourier.freight_charge)}
                                </p>
                              </div>
                              <p className="text-[10px] text-gray-500 flex items-center gap-1 flex-wrap">
                                <span>
                                  {cheapestCourier.estimated_delivery_days} days
                                </span>

                                <span className="flex items-center gap-0.5">
                                  •
                                  <Star className="w-2 h-2 text-main-primary" />
                                  {cheapestCourier.rating}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {fastestCourier &&
                        fastestCourier.courier_company_id !==
                          cheapestCourier?.courier_company_id && (
                          <div
                            onClick={() =>
                              handleCourierSelect(fastestCourier, "FASTEST")
                            }
                            className={`p-2.5 border rounded-lg cursor-pointer transition-all ${selectedCourier?.courier_company_id === fastestCourier.courier_company_id ? "bg-main-secondary/20" : "border-gray-200 hover:border-gray-400"}`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedCourier?.courier_company_id === fastestCourier.courier_company_id ? "bg-main-secondary border-main-secondary" : "border-gray-300"}`}
                              >
                                {selectedCourier?.courier_company_id ===
                                  fastestCourier.courier_company_id && (
                                  <Check className="w-2.5 h-2.5 text-main-primary" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-[10px] bg-main-primary text-main-secondary px-1.5 py-0 rounded-full font-bold">
                                      FASTEST
                                    </span>
                                    <p className="font-semibold text-gray-900 text-xs mt-0.5">
                                      {fastestCourier.courier_name}
                                    </p>
                                  </div>
                                  <p className="font-bold text-black text-sm">
                                    {formatMoney(fastestCourier.freight_charge)}
                                  </p>
                                </div>
                                <p className="text-[10px] text-gray-500 flex items-center gap-1 flex-wrap">
                                  <span>
                                    {fastestCourier.estimated_delivery_days}{" "}
                                    days
                                  </span>

                                  <span className="flex items-center gap-0.5">
                                    •
                                    <Star className="w-2 h-2 text-main-primary" />
                                    {fastestCourier.rating}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      {eligibleCouriers.length > 2 && (
                        <button
                          onClick={() => setShowAllCouriers(!showAllCouriers)}
                          className="text-xs text-main-primary font-semibold flex items-center gap-1 w-full justify-center"
                        >
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${showAllCouriers ? "rotate-180" : ""}`}
                          />
                          {showAllCouriers
                            ? "Hide"
                            : `+${eligibleCouriers.length - 2} more`}
                        </button>
                      )}

                      <AnimatePresence>
                        {showAllCouriers && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-1.5"
                          >
                            {eligibleCouriers
                              .filter(
                                (c: any) =>
                                  c.courier_company_id !==
                                    cheapestCourier?.courier_company_id &&
                                  c.courier_company_id !==
                                    fastestCourier?.courier_company_id,
                              )
                              .map((courier: any) => (
                                <div
                                  key={courier.id}
                                  onClick={() =>
                                    handleCourierSelect(courier, "CUSTOM")
                                  }
                                  className={`p-2 border rounded-lg cursor-pointer transition-all text-xs ${selectedCourier?.courier_company_id === courier.courier_company_id ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900 truncate">
                                      {courier.courier_name}
                                    </span>
                                    <span className="font-bold text-gray-900 ml-2">
                                      {formatMoney(courier.freight_charge)}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-500 flex items-center gap-1 flex-wrap">
                                    <span>
                                      {courier.estimated_delivery_days} days
                                    </span>

                                    <span className="flex items-center gap-0.5">
                                      •
                                      <Star className="w-2 h-2 text-main-primary" />
                                      {courier.rating}
                                    </span>
                                  </p>
                                </div>
                              ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </AccordionCard>

                {/* 4. Payment Method */}
                <AccordionCard
                  id="payment"
                  title="Payment Method"
                  icon={<CreditCard className="w-3.5 h-3.5 text-white" />}
                  badge={paymentBadge}
                  isDone={true}
                  isOpen={openSections.payment}
                  onToggle={() => toggleSection("payment")}
                >
                  <div className="space-y-2">
                    {paymentMethods.map((method) => {
                      const isSelected = paymentMethod === method.id;
                      const isCOD = method.id === "COD";
                      const isDisabled = isCOD && !isCODAvailable;
                      return (
                        <div
                          key={method.id}
                          onClick={() =>
                            !isDisabled && setPaymentMethod(method.id)
                          }
                          className={`border rounded-xl p-3 cursor-pointer transition ${isSelected ? "border-black bg-gray-50 shadow-sm" : "border-gray-200 hover:border-gray-400"} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-black bg-black" : "border-gray-300"}`}
                            >
                              {isSelected && (
                                <Check className="w-2.5 h-2.5 text-white" />
                              )}
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <CreditCard className="w-4 h-4 text-gray-700" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm text-gray-900">
                                  {method.title}
                                </p>
                                {method.recommended && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {method.subtitle}
                              </p>
                              <PaymentLogos type={method.id} />
                              {method.razorpay && (
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  Secured by Razorpay
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionCard>
              </div>

              {/* ── Right: Order Summary (2/5) ───────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="lg:col-span-2 flex flex-col"
              >
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col lg:sticky lg:top-4">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900 text-sm">
                      Order Summary
                    </h2>
                  </div>

                  <div className="px-4 py-3 space-y-4">
                    {/* Coupon */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-4 h-4 text-main-primary" />
                        <h3 className="font-semibold text-gray-900 text-xs">
                          Apply Coupon
                        </h3>
                        {(isLoadingCoupons ||
                          validateCouponMutation.isPending) && (
                          <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                        )}
                      </div>

                      {appliedCoupon ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="font-bold text-green-900 text-xs">
                                  {appliedCoupon.code}
                                </p>
                                <p className="text-[10px] text-green-700">
                                  {appliedCoupon.discountType === "PERCENTAGE"
                                    ? `${appliedCoupon.discountValue}% OFF`
                                    : `₹${appliedCoupon.discountValue} OFF`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={handleRemoveCoupon}
                              disabled={validateCouponMutation.isPending}
                              className="p-1 hover:bg-green-100 rounded transition"
                            >
                              <X className="w-4 h-4 text-green-600" />
                            </button>
                          </div>
                          {couponDiscount > 0 && (
                            <div className="flex justify-between pt-1.5 mt-1.5 border-t border-green-200">
                              <span className="text-[10px] text-green-700">
                                Saving:
                              </span>
                              <span className="text-xs font-bold text-green-700">
                                ₹{couponDiscount.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2" ref={dropdownRef}>
                          <div className="flex gap-1.5">
                            <div className="relative flex-1">
                              <input
                                ref={inputRef}
                                type="text"
                                value={couponCode}
                                onChange={(e) => {
                                  setCouponCode(e.target.value.toUpperCase());
                                  setCouponErrorMsg("");
                                }}
                                onFocus={() => {
                                  if (filteredCoupons.length > 0)
                                    setShowAutocomplete(true);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && couponCode)
                                    handleApplyCoupon(couponCode);
                                }}
                                placeholder="ENTER COUPON CODE"
                                className="w-full px-3 py-2 pr-7 border border-gray-200 rounded-lg focus:outline-none text-xs font-medium uppercase placeholder:normal-case placeholder:text-gray-400 transition"
                                disabled={validateCouponMutation.isPending}
                              />

                              <button
                                onClick={() => {
                                  setShowAutocomplete(!showAutocomplete);
                                  setShowCouponDropdown(!showCouponDropdown);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                              >
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition-transform ${showCouponDropdown ? "rotate-180" : ""}`}
                                />
                              </button>
                            </div>
                            <button
                              onClick={() => handleApplyCoupon(couponCode)}
                              disabled={
                                !couponCode || validateCouponMutation.isPending
                              }
                              className="px-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition disabled:opacity-50 whitespace-nowrap flex items-center gap-1"
                            >
                              {validateCouponMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Apply"
                              )}
                            </button>
                          </div>
                          {couponErrorMsg && (
                            <p className="text-[11px] text-red-600 mt-1 font-medium">
                              {couponErrorMsg}
                            </p>
                          )}
                          <AnimatePresence>
                            {(showAutocomplete || showCouponDropdown) &&
                              filteredCoupons.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  className="absolute z-50 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto"
                                >
                                  {filteredCoupons.map((coupon) => {
                                    const canApply =
                                      subtotal >= coupon.minOrderValue;
                                    const savings =
                                      coupon.estimatedDiscount || 0;
                                    return (
                                      <button
                                        key={coupon.code}
                                        onClick={() =>
                                          canApply && handleCouponSelect(coupon)
                                        }
                                        disabled={
                                          !canApply ||
                                          validateCouponMutation.isPending
                                        }
                                        className={`w-full text-left px-3 py-2.5 border-b last:border-b-0 transition text-xs ${canApply ? "hover:bg-amber-50 cursor-pointer" : "opacity-50 cursor-not-allowed bg-gray-50"}`}
                                      >
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <span className="font-bold text-gray-900">
                                            {coupon.code}
                                          </span>
                                          <span className="text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                                            {coupon.discountType ===
                                            "PERCENTAGE"
                                              ? `${coupon.discountValue}% OFF`
                                              : `₹${coupon.discountValue} OFF`}
                                          </span>
                                        </div>
                                        {!canApply ? (
                                          <p className="text-[10px] text-red-600 font-semibold">
                                            ⚠️ Add ₹
                                            {(
                                              coupon.minOrderValue - subtotal
                                            ).toFixed(2)}{" "}
                                            more
                                          </p>
                                        ) : (
                                          savings > 0 && (
                                            <p className="text-[10px] text-green-600 font-semibold">
                                              ✓ Save ₹{savings.toFixed(2)}
                                            </p>
                                          )
                                        )}
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              )}
                          </AnimatePresence>

                          {availableCoupons.length > 0 && (
                            <button
                              onClick={() => {
                                setShowCouponDropdown(!showCouponDropdown);
                                setShowAutocomplete(!showAutocomplete);
                              }}
                              className="text-xs text-amber-600 font-semibold flex items-center gap-1 transition hover:text-amber-700"
                            >
                              <Percent className="w-3 h-3" />
                              {showCouponDropdown
                                ? "Hide coupons"
                                : `${availableCoupons.length} coupon${availableCoupons.length !== 1 ? "s" : ""} available`}
                            </button>
                          )}
                          {availableCoupons.length === 0 &&
                            !isLoadingCoupons && (
                              <p className="text-[10px] text-gray-400 text-center py-1.5 bg-gray-50 rounded">
                                No coupons available
                              </p>
                            )}
                        </div>
                      )}

                      {couponError && (
                        <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg mt-2 flex gap-1.5">
                          <span>⚠️</span>
                          <span>{couponError}</span>
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          Subtotal ({displayItems.length} item
                          {displayItems.length !== 1 ? "s" : ""})
                        </span>
                        {invalidCartItems.length > 0 ? (
                          <span className="font-semibold text-red-700">
                            Fix cart items
                          </span>
                        ) : isLoadingPreview ? (
                          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                        ) : !orderPreview ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <span className="font-semibold text-gray-900">
                            ₹{subtotal.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {couponDiscount > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex justify-between text-xs text-green-600 font-semibold bg-green-50 -mx-1 px-1 py-1 rounded"
                        >
                          <span className="flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            Coupon ({appliedCoupon?.code})
                          </span>
                          <span>-₹{couponDiscount.toLocaleString()}</span>
                        </motion.div>
                      )}

                      <div className="flex justify-between text-xs text-gray-600">
                        <div>
                          <span>Shipping</span>
                          <span className="text-[10px] text-gray-400 block">
                            {estimatedDelivery}
                          </span>
                        </div>
                        {invalidCartItems.length > 0 ? (
                          <span className="text-gray-400">—</span>
                        ) : isLoadingPreview ? (
                          <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
                        ) : !orderPreview ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <span
                            className={`font-semibold ${shippingCost === 0 ? "text-green-600" : "text-gray-900"}`}
                          >
                            {isFreeShipping
                              ? "FREE"
                              : `₹${shippingCost.toFixed(2)}`}
                          </span>
                        )}
                      </div>

                      {gstAmount > 0 && (
                        <>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>CGST (2.5%)</span>
                            {isLoadingPreview ? (
                              <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
                            ) : (
                              <span>₹{cgstAmount.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>SGST (2.5%)</span>
                            {isLoadingPreview ? (
                              <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
                            ) : (
                              <span>₹{sgstAmount.toFixed(2)}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Total + CTA */}
                  <div className="border-t border-gray-200 px-4 py-3 bg-white rounded-b-xl">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="font-bold text-gray-900 text-sm">
                        Total
                      </span>
                      {invalidCartItems.length > 0 ? (
                        <span className="text-sm font-semibold text-red-700">
                          Fix cart items
                        </span>
                      ) : isLoadingPreview ? (
                        <div className="h-7 w-28 bg-gray-200 animate-pulse rounded" />
                      ) : !orderPreview ? (
                        <span className="max-w-40 text-right text-xs text-gray-500">
                          Select an address and courier to calculate
                        </span>
                      ) : (
                        <div className="text-right">
                          <span className="text-2xl font-bold text-gray-900">
                            ₹
                            {total.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          {gstAmount > 0 && (
                            <p className="text-[10px] text-gray-400">
                              incl. GST ₹{gstAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {!isLoadingPreview &&
                      !invalidCartItems.length &&
                      !!orderPreview &&
                      (couponDiscount > 0 || isFreeShipping) && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {couponDiscount > 0 && (
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                              🎉 Saved ₹{couponDiscount.toLocaleString()}
                            </span>
                          )}
                          {isFreeShipping && (
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Truck className="w-3 h-3" /> Free Shipping
                            </span>
                          )}
                        </div>
                      )}

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handlePlaceOrder}
                      disabled={
                        displayItems.length === 0 ||
                        invalidCartItems.length > 0 ||
                        !selectedAddress ||
                        !selectedCourier ||
                        !orderPreview ||
                        subtotal <= 0 ||
                        total <= 0 ||
                        isProcessing ||
                        !user ||
                        isLoadingPreview ||
                        !isServiceable ||
                        isErrorOrderPreview
                      }
                      className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                      <Lock className="w-4 h-4" />
                      {invalidCartItems.length > 0
                        ? "Fix cart items to continue"
                        : !isServiceable
                          ? "Delivery Not Available"
                          : isProcessing
                            ? "Processing..."
                            : !user
                              ? "Login to Place Order"
                              : !selectedAddress
                                ? "Add delivery address"
                                : !selectedCourier
                                  ? "Select courier"
                                  : isLoadingPreview
                                    ? "Calculating..."
                                    : isErrorOrderPreview || !orderPreview
                                      ? "Check delivery details"
                                      : subtotal <= 0 || total <= 0
                                        ? "Verify order total"
                                        : `Place Order — ₹${total.toLocaleString()}`}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        existingAddress={editingAddress ?? undefined}
        mode={editingAddress ? "edit" : "create"}
      />
    </>
  );
}
