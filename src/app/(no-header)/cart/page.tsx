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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { toast } from "@/store/useToastStore";
import { useQuery, useMutation } from "@tanstack/react-query";
import { couponApi, type Coupon } from "@/lib/api/coupon.api";
import { cartApi } from "@/lib/api/cart.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { shippingApi } from "@/lib/api/shipping.api";
import { addressApi } from "@/lib/api/addresses.api";

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
    refetch: refetchCartApi,
  } = useQuery({
    queryKey: ["cartApi", user?.id],
    queryFn: async () => (await cartApi.getCart()).data,
    enabled: !!user,
    staleTime: 0,
  });

  const apiItems = cartData?.items ?? [];
  const displayItems = user?.id ? apiItems : items;
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
  const getStockQty = (item: any) => {
    // 1. Variant stock (preferred)
    if (item?.variant?.stock?.length > 0) {
      return Number(item.variant.stock[0].quantity);
    }

    // 2. Product stock fallback
    if (item?.product?.stock?.length > 0) {
      const match = item.product.stock.find(
        (s: any) => s.variantId === item.variantId,
      );
      if (match) return Number(match.quantity);
    }

    // 3. Final fallback (IMPORTANT)
    return Number(item?.variant?.quantity ?? item?.product?.quantity ?? 0);
  };
  const {
    data: shippingData,
    isLoading: isLoadingShipping,
    refetch: refetchShipping,
  } = useQuery({
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
    staleTime: 0,
  });

  // Reset courier when shipping data changes so stale selection isn't kept
  useEffect(() => {
    setSelectedCourier(null);
  }, [deliveryPin]);

  useEffect(() => {
    if (
      shippingData &&
      shippingData.availableCouriers?.length > 0 &&
      !selectedCourier
    ) {
      setSelectedCourier(shippingData.cheapestCourier);
    }
  }, [shippingData, selectedCourier]);

  const {
    data: applicableCouponsData,
    isLoading: isLoadingCoupons,
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
        price:
          item.variant?.price ?? item.product?.sellingPrice ?? item.price ?? 0,
      }));
      return await couponApi.validateCoupon({
        code: code.toUpperCase(),
        orderAmount: subtotal,
        cartItems,
      });
    },
    onSuccess: (response, code) => {
      if (
        response.valid &&
        response.coupon &&
        response.discount !== undefined
      ) {
        applyCoupon({
          code: response.coupon.code,
          discountType: response.coupon.discountType,
          discountValue: response.coupon.discountValue,
          minOrderValue: response.coupon.minOrderValue,
          maxDiscountAmount: response.coupon.maxDiscountAmount,
          validFrom: response.coupon.validFrom,
          validUntil: response.coupon.validUntil,
          isActive: response.coupon.isActive,
          discountAmount: response.discount,
          finalAmount: response.finalAmount,
        });
        toast.success(`Coupon "${code}" applied successfully!`);
        setCouponCode("");
        setShowCouponDropdown(false);
        setShowAutocomplete(false);
        refetchCoupons();
      } else {
        toast.error(response.error || "Invalid coupon code");
      }
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
    onSuccess: async () => {
      await refetchCartApi();
      // Refetch shipping when quantity changes (affects chargeable weight)
      await refetchShipping();
    },
    onError: (err: any) =>
      toast.error(err?.message || "Failed to update quantity"),
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => await cartApi.removeFromCart(itemId),
    onSuccess: async () => {
      toast.success("Item removed");
      await refetchCartApi();
      await refetchShipping();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to remove item"),
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
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
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
                    const stockQty = getStockQty(item);
                    console.log("item-cart", item);

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
                                  <h3 className="font-bold text-gray-900 text-sm hover:text-amber-600 transition cursor-pointer line-clamp-1">
                                    {item.product?.name}
                                  </h3>
                                </Link>
                                {item?.variant && (
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {item.variant.color && (
                                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                        {item.variant.color}
                                      </span>
                                    )}
                                    {item.variant.size && (
                                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                        Size: {item.variant.size}
                                      </span>
                                    )}
                                    {item.variant.fabric && (
                                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                        {item.variant.fabric}
                                      </span>
                                    )}
                                    {normalizeAttributes(
                                      item.variant.attributes,
                                    ).map((attr) => (
                                      <span
                                        key={attr.key}
                                        className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100"
                                      >
                                        {attr.key}: <b>{attr.value}</b>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  user?.id
                                    ? removeItemMutation.mutate(item.id)
                                    : removeItem(item.id)
                                }
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0"
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
                                  className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 transition disabled:opacity-40"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-7 text-center font-bold text-gray-900 text-sm">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => {
                                    const n = item.quantity + 1;
                                    user
                                      ? updateQtyMutation.mutate({
                                          itemId: item.id,
                                          quantity: n,
                                        })
                                      : updateQuantity(item.id, n);
                                  }}
                                  disabled={
                                    stockQty === 0 || item.quantity >= stockQty
                                  }
                                  className="w-7 h-7 flex items-center justify-center text-white bg-gray-900 rounded-full hover:bg-gray-700 transition disabled:opacity-40"
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
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-center justify-between">
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
                      <div className="space-y-2" ref={dropdownRef}>
                        <div className="flex gap-1.5">
                          <div className="relative flex-1">
                            <input
                              ref={inputRef}
                              type="text"
                              value={couponCode}
                              onChange={(e) =>
                                setCouponCode(e.target.value.toUpperCase())
                              }
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

                        {availableCoupons.length === 0 && !isLoadingCoupons && (
                          <p className="text-[10px] text-gray-400 text-center py-1.5 bg-gray-50 rounded">
                            No coupons available for your cart
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Courier Selection */}
                  {shippingData && shippingData.serviceable && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-500" />
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
                                  className={`w-full p-3 text-left border-b hover:bg-green-50 transition ${selectedCourier?.courier_company_id === shippingData.cheapestCourier.courier_company_id ? "bg-green-50" : ""}`}
                                >
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0 rounded-full font-bold">
                                      CHEAPEST
                                    </span>
                                    {selectedCourier?.courier_company_id ===
                                      shippingData.cheapestCourier
                                        .courier_company_id && (
                                      <Check className="w-3 h-3 text-green-600" />
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
                                    className={`w-full p-3 text-left border-b hover:bg-blue-50 transition ${selectedCourier?.courier_company_id === shippingData.fastestCourier.courier_company_id ? "bg-blue-50" : ""}`}
                                  >
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0 rounded-full font-bold">
                                        FASTEST
                                      </span>
                                      {selectedCourier?.courier_company_id ===
                                        shippingData.fastestCourier
                                          .courier_company_id && (
                                        <Check className="w-3 h-3 text-blue-600" />
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
                                        <p className="text-[10px] text-gray-500">
                                          {courier.estimated_delivery_days} days
                                          • ⭐ {courier.rating}
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
                  )}

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
                          <p className="text-[10px] text-blue-500">
                            {selectedCourier.courier_name}
                          </p>
                        )}
                      </div>
                      <span
                        className={`font-semibold ${shippingCost === 0 && shippingData ? "text-green-600" : "text-gray-900"}`}
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
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleCheckout}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold shadow hover:shadow-md transition flex items-center justify-center gap-2 text-sm group"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
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
