"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Lock,
  ShoppingBag,
  X,
  Check,
  Gift,
  Percent,
  ChevronDown,
  Loader2,
  Truck,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { toast } from "@/store/useToastStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponApi, type Coupon } from "@/lib/api/coupon.api";
import { cartApi } from "@/lib/api/cart.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { shippingApi } from "@/lib/api/shipping.api";
import { addressApi } from "@/lib/api/addresses.api";
import { extractVariantAttributes } from "@/lib/utils/variant.utils";
import { mergeCartLines } from "@/lib/utils/cartItems";
import {
  getCartItemStockState,
  getCartItemStockMessage,
  validateCartForCheckout,
} from "@/lib/utils/cartStock";

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

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuthModal();
  const queryClient = useQueryClient();

  const {
    items,
    appliedCoupon,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    getTotalItems,
    getSubtotal,
    getDiscount,
    getTotal,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [showCourierDropdown, setShowCourierDropdown] = useState(false);
  const courierDropdownRef = useRef<HTMLDivElement>(null);
  const [couponErrorMsg, setCouponErrorMsg] = useState("");
  const CGST_RATE = 0.025;
  const SGST_RATE = 0.025;

  const { data: addressData, isLoading: isLoadingAddress } = useQuery({
    queryKey: ["address-default"],
    queryFn: async () => (await addressApi.getDefaultAddress()).data,
    enabled: !!user,
  });

  const {
    data: cartData,
    isLoading: isLoadingCartApi,
    isError: isCartError,
    error: cartError,
    refetch: refetchCartApi,
  } = useQuery({
    queryKey: ["cartApi", user?.id],
    queryFn: async () => (await cartApi.getCart()).data,
    enabled: !!user,
    // Stock can change while the customer is away from the cart.
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const apiItems = cartData?.items ?? [];
  const displayItems = useMemo(
    () => mergeCartLines(user?.id ? apiItems : items),
    [user?.id, apiItems, items],
  );
  // Stock problems are shown beside the affected item and in the checkout CTA.
  // Avoid an automatic error toast when the customer simply opens the cart.
  const cartStockValidation = useMemo(
    () => validateCartForCheckout(displayItems),
    [displayItems],
  );

  const deliveryPin = user?.id ? addressData?.pincode : deliveryPincode;
  const totalItems = useMemo(
    () => displayItems.reduce((sum: number, i: any) => sum + i.quantity, 0),
    [displayItems],
  );

  const getStrictItemPrice = (item: any) => {
    if (item?.variant) return Number(item.variant.sellingPrice ?? 0);
    return Number(item?.product?.sellingPrice ?? 0);
  };

  const subtotal = useMemo(
    () =>
      displayItems.reduce(
        (sum: number, i: any) => sum + getStrictItemPrice(i) * i.quantity,
        0,
      ),
    [displayItems],
  );

  const discount = appliedCoupon?.discountAmount
    ? Number(appliedCoupon.discountAmount)
    : 0;

  // ─── FIX: Pass cartItems to shipping API so backend calculates correct weight ───
  const shippingCartItems = useMemo(
    () =>
      displayItems.map((item: any) => ({
        productId: item.productId ?? item.product?.id,
        variantId: item.variantId ?? item.variant?.id,
        quantity: item.quantity,
      })),
    [displayItems],
  );

  const { data: shippingData, isLoading: isLoadingShipping } = useQuery({
    queryKey: ["cartShipping", deliveryPin, shippingCartItems],
    queryFn: async () => {
      if (!deliveryPin || displayItems.length === 0) return null;
      const response = await shippingApi.getCartShippingRates({
        deliveryPincode: deliveryPin,
        // ✅ Pass actual cart items so backend uses correct product weights
        cartItems: shippingCartItems,
      });
      return response.data;
    },
    enabled: !!deliveryPin && displayItems.length > 0,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });

  // Reset courier when shipping data changes so stale selection isn't kept
  useEffect(() => {
    setSelectedCourier(null);
  }, [deliveryPin]);

  useEffect(() => {
    if (!shippingData) return;
    const couriers = shippingData.availableCouriers ?? [];
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
  }, [shippingData, selectedCourier]);

  const {
    data: applicableCouponsData,
    isLoading: isLoadingCoupons,
    isFetching: isFetchingCoupons,
    refetch: refetchCoupons,
  } = useQuery({
    queryKey: ["applicableCoupons", subtotal, displayItems.length],
    queryFn: async () => {
      if (displayItems.length === 0) return { data: [] };
      const cartItems = displayItems.map((item: any) => ({
        productId: item.productId ?? item.product?.id,
        categoryId: item.categoryId,
        quantity: item.quantity,
        price: getStrictItemPrice(item),
      }));
      return await couponApi.getApplicableCoupons({
        orderAmount: subtotal,
        cartItems,
      });
    },
    enabled: displayItems.length > 0,
    staleTime: 30000,
    placeholderData: (prev) => prev,
  });

  const availableCoupons = applicableCouponsData?.data ?? [];
  const filteredCoupons = useMemo(() => {
    if (!couponCode) return availableCoupons;
    return availableCoupons.filter((coupon) =>
      coupon.code.toLowerCase().includes(couponCode.toLowerCase()),
    );
  }, [couponCode, availableCoupons]);

  useEffect(() => {
    setShowAutocomplete(!!couponCode && filteredCoupons.length > 0);
  }, [couponCode, filteredCoupons.length]);

  const shippingCost = useMemo(() => {
    if (!shippingData) return 0;
    if (shippingData.isFreeShipping) return 0;
    if (!selectedCourier) return Number(shippingData.shippingCost ?? 0);
    return Number(selectedCourier.freight_charge ?? 0);
  }, [shippingData, selectedCourier]);

  const { cgstAmount, sgstAmount, gstAmount } = useMemo(() => {
    const taxableAmount = subtotal - discount + shippingCost;
    const cgst = taxableAmount * CGST_RATE;
    const sgst = taxableAmount * SGST_RATE;
    return { cgstAmount: cgst, sgstAmount: sgst, gstAmount: cgst + sgst };
  }, [subtotal, discount, shippingCost]);

  const total = useMemo(() => {
    const taxableAmount = subtotal - discount + shippingCost;
    return taxableAmount + gstAmount;
  }, [subtotal, discount, shippingCost, gstAmount]);

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
      if (
        courierDropdownRef.current &&
        !courierDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCourierDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const cartItems = displayItems.map((item: any) => ({
        productId: item.productId ?? item.product?.id,
        categoryId: item.categoryId,
        quantity: item.quantity,
        price: getStrictItemPrice(item),
      }));
      return await couponApi.validateCoupon({
        code: code.toUpperCase(),
        orderAmount: subtotal,
        cartItems,
      });
    },
    onSuccess: (response, code) => {
      console.log("coupon response", response);

      // ❌ Invalid response (no data)
      if (!response?.success) {
        const errorMsg = response?.message || "Invalid coupon code";
        toast.error(errorMsg);
        setCouponErrorMsg(errorMsg);
        return;
      }

      const payload = response.data;

      // ❌ Invalid coupon
      if (!payload || !payload.valid) {
        const errorMsg = payload?.message || "Invalid coupon code";
        toast.error(errorMsg);
        setCouponErrorMsg(errorMsg);
        return;
      }

      // ✅ SUCCESS
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
        finalAmount: payload.finalAmount,
      });

      toast.success(`Coupon "${code}" applied successfully!`);
      setCouponCode("");
      setShowCouponDropdown(false);
      setShowAutocomplete(false);
      refetchCoupons();
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to apply coupon"),
  });

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
      if (context?.previousCart)
        queryClient.setQueryData(context.queryKey, context.previousCart);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update quantity",
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["cartApi"] }),
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
    onSuccess: () => toast.success("Item removed"),
    onError: (err: any, _itemId, context) => {
      if (context?.previousCart)
        queryClient.setQueryData(context.queryKey, context.previousCart);
      toast.error(err?.message || "Failed to remove item");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["cartApi"] }),
  });

  const handleApplyCoupon = (code: string) => {
    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    validateCouponMutation.mutate(code);
  };
  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.info("Coupon removed");
    refetchCoupons();
  };
  const handleCheckout = () => {
    if (displayItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const validation = validateCartForCheckout(displayItems);

    if (!validation.valid) {
      toast.error(
        validation.errors[0]?.message ??
          "Please update your cart before continuing.",
      );
      return;
    }

    router.push("/checkout");
  };
  const handleCouponSelect = (coupon: Coupon) => {
    setCouponCode(coupon.code);
    setShowAutocomplete(false);
    handleApplyCoupon(coupon.code);
  };
  const formatMoney = (value: number) => `₹${Number(value || 0).toFixed(2)}`;

  if (isLoadingCartApi) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="h-screen flex flex-col items-center justify-center gap-3 text-gray-500"
      >
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Loading your cart…</p>
      </div>
    );
  }

  // A rejected cart request must settle into a recoverable state, rather than
  // silently presenting an empty cart. Refresh-token failure is handled by the
  // shared API interceptor, which clears the expired session and opens sign-in.
  if (user?.id && isCartError && !cartData) {
    return (
      <div className="h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <div
          role="alert"
          className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"
        >
          <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-gray-400" />
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            We couldn’t load your cart
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Your items haven’t been removed. Please try again.
          </p>
          <button
            type="button"
            onClick={() => void refetchCartApi()}
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <div className="h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-5 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added anything yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-black text-white px-7 py-3 rounded-full font-semibold hover:bg-gray-800 transition"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex flex-col">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex-none bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/shop">
              <motion.button
                whileHover={{ x: -3 }}
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm transition"
              >
                <ArrowLeft className="w-4 h-4" /> Shop
              </motion.button>
            </Link>
            <div className="h-4 w-px bg-gray-300" />
            <h1 className="text-xl font-bold text-gray-900">
              Shopping Cart
              <span className="text-sm text-gray-400 font-normal ml-2">
                ({totalItems} {totalItems === 1 ? "item" : "items"})
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      {/* ─── Body ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full px-4 py-4">
          <div className="grid lg:grid-cols-5 gap-4 h-full">
            {/* ── Cart Items (3/5) ────────────────────────────────────── */}
            <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <AnimatePresence mode="popLayout">
                  {displayItems.map((item: any, index: number) => {
                    const stockState = getCartItemStockState(item);
                    const stockMessage = getCartItemStockMessage(item);
                    const cartQuantity = Number(item.quantity) || 0;
                    const canIncreaseQuantity =
                      !stockState.isOutOfStock &&
                      cartQuantity < stockState.maxAllowed;
                    const customerStockMessage =
                      stockState.isLastOne && !stockState.isOutOfStock
                        ? {
                            type: "warning" as const,
                            message:
                              "Last one available — order now to make it yours!",
                          }
                        : stockMessage;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -80 }}
                        transition={{ delay: index * 0.04 }}
                        className="bg-white rounded-xl p-3.5 shadow-sm border border-white/80 hover:shadow-md transition"
                      >
                        <div className="flex gap-3">
                          <Link href={`/products/${item?.product?.slug}`}>
                            <motion.div
                              whileHover={{ scale: 1.04 }}
                              className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
                            >
                              {item?.product?.media ? (
                                <Image
                                  src={item?.product?.media?.[0].url}
                                  alt={item.product?.name}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <ShoppingBag className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </motion.div>
                          </Link>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <Link href={`/products/${item?.product?.slug}`}>
                                  <h3 className="font-bold text-gray-900 text-sm hover:text-main-primary transition cursor-pointer line-clamp-1">
                                    {item.product?.name}
                                  </h3>
                                </Link>
                                {(() => {
                                  const variantAttrs = extractVariantAttributes(
                                    item?.variant,
                                  );
                                  if (variantAttrs.length === 0) return null;
                                  return (
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                      {variantAttrs.map(({ key, value }) => (
                                        <span
                                          key={key}
                                          className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium"
                                        >
                                          {key}:{" "}
                                          <span className="text-gray-900 font-semibold">
                                            {value}
                                          </span>
                                        </span>
                                      ))}
                                    </div>
                                  );
                                })()}
                                {customerStockMessage && (
                                  <div className="mt-2">
                                    <span
                                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${
                                        customerStockMessage.type === "error"
                                          ? "text-red-700 bg-red-50 border-red-200"
                                          : customerStockMessage.type ===
                                              "warning"
                                            ? "text-amber-800 bg-amber-50 border-amber-200"
                                            : "text-gray-600 bg-gray-50 border-gray-200"
                                      }`}
                                      role={
                                        customerStockMessage.type === "error"
                                          ? "alert"
                                          : "status"
                                      }
                                    >
                                      {customerStockMessage.type ===
                                        "warning" && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                      )}
                                      {customerStockMessage.message}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  user?.id
                                    ? removeItemMutation.mutate(String(item.id))
                                    : removeItem(String(item.id))
                                }
                                disabled={removeItemMutation.isPending}
                                aria-busy={removeItemMutation.isPending}
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0 disabled:cursor-wait disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-2.5">
                              <p className="text-lg font-bold text-gray-900">
                                ₹
                                {getStrictItemPrice(item).toLocaleString(
                                  "en-IN",
                                )}
                              </p>
                              <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-2 py-1">
                                <button
                                  onClick={() => {
                                    const n = item.quantity - 1;
                                    if (n < 1) return;
                                    user
                                      ? updateQtyMutation.mutate({
                                          itemId: item.id,
                                          quantity: n,
                                        })
                                      : updateQuantity(item.id, n);
                                  }}
                                  disabled={item.quantity <= 1}
                                  className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-7 text-center font-bold text-gray-900 text-sm">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => {
                                    const nextQuantity =
                                      Number(item.quantity) + 1;

                                    if (!canIncreaseQuantity) {
                                      return;
                                    }

                                    user?.id
                                      ? updateQtyMutation.mutate({
                                          itemId: item.id,
                                          quantity: nextQuantity,
                                        })
                                      : updateQuantity(item.id, nextQuantity);
                                  }}
                                  disabled={
                                    updateQtyMutation.isPending ||
                                    !canIncreaseQuantity
                                  }
                                  aria-label="Increase quantity"
                                  title={
                                    !canIncreaseQuantity
                                      ? stockState.isLastOne
                                        ? "Only one item is available"
                                        : "Maximum available quantity reached"
                                      : "Increase quantity"
                                  }
                                  className="w-7 h-7 flex items-center justify-center text-white bg-gray-900 rounded-full hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Order Summary (2/5) ─────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 flex flex-col h-full overflow-hidden"
            >
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="flex-none px-4 py-3 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 text-sm">
                    Order Summary
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                  {/* Coupon */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-4 h-4 text-main-primary" />
                      <h3 className="font-semibold text-gray-900 text-xs">
                        Apply Coupon
                      </h3>
                      {isLoadingCoupons && (
                        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                      )}
                    </div>

                    {appliedCoupon ? (
                      <div className="bg-main-primary/5 border border-green-200 rounded-lg p-2.5 flex items-center justify-between">
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
                          className="p-1 hover:bg-green-100 rounded transition"
                        >
                          <X className="w-4 h-4 text-green-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 min-h-[60px]" ref={dropdownRef}>
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
                                if (couponCode) setShowAutocomplete(true);
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
                            className="px-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-1"
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
                                  const savings = coupon.estimatedDiscount || 0;
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
                                        <span className="text-[10px] bg-amber-400 text-gray-900 px-1.5 py-0.5 rounded-full font-bold">
                                          {coupon.discountType === "PERCENTAGE"
                                            ? `${coupon.discountValue}% OFF`
                                            : `₹${coupon.discountValue} OFF`}
                                        </span>
                                      </div>
                                      {coupon.description && (
                                        <p className="text-[10px] text-gray-500 mb-0.5 line-clamp-1">
                                          {coupon.description}
                                        </p>
                                      )}
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

                        <button
                          onClick={() => {
                            setShowCouponDropdown(!showCouponDropdown);
                            setShowAutocomplete(!showAutocomplete);
                          }}
                          className="text-xs text-main-primary hover:text-main-primary/80 font-semibold flex items-center gap-1 transition"
                        >
                          <Percent className="w-3 h-3" />
                          {showCouponDropdown
                            ? "Hide coupons"
                            : `View ${availableCoupons.length} available coupon${availableCoupons.length !== 1 ? "s" : ""}`}
                        </button>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[10px] text-gray-400 text-center py-1.5 bg-gray-50 rounded"
                        >
                          {availableCoupons.length === 0 &&
                            !isLoadingCoupons &&
                            !isFetchingCoupons &&
                            "No coupons available for your cart"}
                          {isLoadingCoupons && isFetchingCoupons && (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            </div>
                          )}
                        </motion.div>
                      </div>
                    )}
                  </div>

                  {/* Courier Selection */}
                  {/* {shippingData && shippingData.serviceable && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-main-primary" />
                          <h3 className="font-semibold text-gray-900 text-xs">
                            Select Courier
                          </h3>
                        </div>
                        {isLoadingShipping && (
                          <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                        )}
                      </div>

                      <div className="relative" ref={courierDropdownRef}>
                        <button
                          onClick={() =>
                            setShowCourierDropdown(!showCourierDropdown)
                          }
                          className="w-full p-2.5 border border-gray-200 rounded-lg hover:border-gray-400 transition text-left flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {selectedCourier?.courier_name ||
                                "Select Courier"}
                            </p>
                            {selectedCourier && (
                              <p className="text-[10px] text-gray-500">
                                {selectedCourier.estimated_delivery_days} days •{" "}
                                {formatMoney(selectedCourier.freight_charge)}
                              </p>
                            )}
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${showCourierDropdown ? "rotate-180" : ""}`}
                          />
                        </button>

                        <AnimatePresence>
                          {showCourierDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto"
                            >
                              {shippingData.cheapestCourier && (
                                <button
                                  onClick={() => {
                                    setSelectedCourier(
                                      shippingData.cheapestCourier,
                                    );
                                    setShowCourierDropdown(false);
                                  }}
                                  className={`w-full p-3 text-left border-b hover:bg-green-50 transition ${selectedCourier?.courier_company_id === shippingData.cheapestCourier.courier_company_id ? "bg-main-primary/10" : ""}`}
                                >
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[10px] bg-main-primary/10 text-main-primary px-1.5 py-0 rounded-full font-bold">
                                      Affordable
                                    </span>
                                    {selectedCourier?.courier_company_id ===
                                      shippingData.cheapestCourier
                                        .courier_company_id && (
                                      <Check className="w-3 h-3 text-main-primary" />
                                    )}
                                  </div>
                                  <p className="font-semibold text-gray-900 text-xs">
                                    {shippingData.cheapestCourier.courier_name}
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    {
                                      shippingData.cheapestCourier
                                        .estimated_delivery_days
                                    }{" "}
                                    days •{" "}
                                    {formatMoney(
                                      shippingData.cheapestCourier
                                        .freight_charge,
                                    )}
                                  </p>
                                </button>
                              )}

                              {shippingData.fastestCourier &&
                                shippingData.fastestCourier
                                  .courier_company_id !==
                                  shippingData.cheapestCourier
                                    ?.courier_company_id && (
                                  <button
                                    onClick={() => {
                                      setSelectedCourier(
                                        shippingData.fastestCourier,
                                      );
                                      setShowCourierDropdown(false);
                                    }}
                                    className={`w-full p-3 text-left border-b hover:bg-blue-50 transition ${selectedCourier?.courier_company_id === shippingData.fastestCourier.courier_company_id ? "bg-main-primary-two/10" : ""}`}
                                  >
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-[10px] bg-main-primary/10 text-main-primary px-1.5 py-0 rounded-full font-bold">
                                        FASTEST
                                      </span>
                                      {selectedCourier?.courier_company_id ===
                                        shippingData.fastestCourier
                                          .courier_company_id && (
                                        <Check className="w-3 h-3 text-main-primary-two" />
                                      )}
                                    </div>
                                    <p className="font-semibold text-gray-900 text-xs">
                                      {shippingData.fastestCourier.courier_name}
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                      {
                                        shippingData.fastestCourier
                                          .estimated_delivery_days
                                      }{" "}
                                      days •{" "}
                                      {formatMoney(
                                        shippingData.fastestCourier
                                          .freight_charge,
                                      )}
                                    </p>
                                  </button>
                                )}

                              {shippingData.availableCouriers
                                ?.filter(
                                  (c: any) =>
                                    c.courier_company_id !==
                                      shippingData.cheapestCourier
                                        ?.courier_company_id &&
                                    c.courier_company_id !==
                                      shippingData.fastestCourier
                                        ?.courier_company_id,
                                )
                                .slice(0, 8)
                                .map((courier: any) => (
                                  <button
                                    key={courier.id}
                                    onClick={() => {
                                      setSelectedCourier(courier);
                                      setShowCourierDropdown(false);
                                    }}
                                    className={`w-full p-3 text-left border-b last:border-b-0 hover:bg-gray-50 transition ${selectedCourier?.courier_company_id === courier.courier_company_id ? "bg-gray-50" : ""}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 text-xs truncate">
                                          {courier.courier_name}
                                        </p>
                                        <p className="text-[10px] text-gray-500 flex items-center gap-1 flex-wrap">
                                          <span>
                                            {courier.estimated_delivery_days}{" "}
                                            days
                                          </span>

                                          <span className="flex items-center gap-0.5">
                                            •
                                            <Star className="w-2 h-2 text-main-primary" />
                                            {courier.rating}
                                          </span>
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1.5 ml-2">
                                        <p className="font-bold text-gray-900 text-xs">
                                          {formatMoney(courier.freight_charge)}
                                        </p>
                                        {selectedCourier?.courier_company_id ===
                                          courier.courier_company_id && (
                                          <Check className="w-3 h-3 text-gray-600" />
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )} */}

                  {/* Price Breakdown */}
                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""}
                        )
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatMoney(subtotal)}
                      </span>
                    </div>

                    {discount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-between text-xs text-green-600 font-semibold bg-green-50 -mx-1 px-1 py-1 rounded"
                      >
                        <span className="flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          Coupon ({appliedCoupon?.code})
                        </span>
                        <span>-{formatMoney(discount)}</span>
                      </motion.div>
                    )}

                    <div className="flex justify-between text-xs text-gray-600">
                      <div>
                        <span>Shipping</span>
                        {selectedCourier && (
                          <p className="text-[10px] text-main-primary">
                            {selectedCourier.courier_name}
                          </p>
                        )}
                      </div>
                      <span
                        className={`font-semibold ${shippingCost === 0 && shippingData ? "text-main-primary" : "text-gray-900"}`}
                      >
                        {!shippingData ? (
                          isLoadingShipping ? (
                            <Loader2 className="w-3 h-3 animate-spin inline" />
                          ) : (
                            "—"
                          )
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
                </div>

                {/* Total + CTA */}
                <div className="flex-none border-t border-gray-200 px-4 py-3 bg-white">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-bold text-gray-900 text-sm">
                      Total
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatMoney(total)}
                      </span>
                      <p className="text-[10px] text-gray-400">
                        incl. all taxes
                      </p>
                    </div>
                  </div>

                  {discount > 0 && (
                    <p className="text-xs text-green-600 font-semibold text-right mb-2">
                      🎉 You saved {formatMoney(discount)}
                    </p>
                  )}

                  <motion.button
                    whileHover={
                      cartStockValidation.valid ? { scale: 1.01 } : undefined
                    }
                    whileTap={
                      cartStockValidation.valid ? { scale: 0.99 } : undefined
                    }
                    onClick={handleCheckout}
                    disabled={!cartStockValidation.valid}
                    aria-disabled={!cartStockValidation.valid}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold shadow hover:shadow-md transition flex items-center justify-center gap-2 text-sm group disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {cartStockValidation.valid
                      ? "Proceed to Checkout"
                      : "Update cart to continue"}
                    {cartStockValidation.valid && (
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
