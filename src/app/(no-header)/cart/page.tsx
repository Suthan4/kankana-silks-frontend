"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  Tag,
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
      .map((a) => ({
        key: String(a.key),
        value: String(a.value),
      }));
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

  const {
    data: addressData,
    isLoading: isLoadingAddress,
    refetch: refetchAddress,
  } = useQuery({
    queryKey: ["address-defualt"],
    queryFn: async () => {
      const response = await addressApi.getDefaultAddress();
      return response.data;
    },
    enabled: !!user,
  });

  const {
    data: cartData,
    isLoading: isLoadingCartApi,
    refetch: refetchCartApi,
  } = useQuery({
    queryKey: ["cartApi", user?.id],
    queryFn: async () => {
      const res = await cartApi.getCart();
      return res.data; // ✅ Cart object
    },
    enabled: !!user,
    staleTime: 0,
  });
  console.log("addressData", addressData);

  const apiItems = cartData?.items ?? [];
  const displayItems = user?.id ? apiItems : items; // items from zustand store
  const deliveryPin = user?.id ? addressData?.pincode : deliveryPincode;
  console.log("apiItems", JSON.stringify(apiItems));

  const totalItems = useMemo(() => {
    return displayItems.reduce((sum: number, i: any) => sum + i.quantity, 0);
  }, [displayItems]);

  const subtotal = useMemo(() => {
    return displayItems.reduce((sum: number, i: any) => {
      const unitPrice =
        i.variant?.price ??
        i.product?.sellingPrice ??
        i.product?.basePrice ??
        i.price ??
        0;

      return sum + unitPrice * i.quantity;
    }, 0);
  }, [displayItems]);

  const discount = appliedCoupon?.discountAmount
    ? Number(appliedCoupon.discountAmount)
    : 0;

  // Fetch shipping rates when pincode is entered
  const {
    data: shippingData,
    isLoading: isLoadingShipping,
    refetch: refetchShipping,
  } = useQuery({
    queryKey: ["cartShipping", deliveryPin, displayItems.length, subtotal],
    queryFn: async () => {
      if (!deliveryPin || displayItems.length === 0) return null;

      const response = await shippingApi.getCartShippingRates({
        deliveryPincode: deliveryPin,
      });
      return response.data;
    },
    enabled: !!deliveryPin && displayItems.length > 0,
  });
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
        price:
          item.variant?.price ?? item.product?.sellingPrice ?? item.price ?? 0,
      }));

      return await couponApi.getApplicableCoupons({
        orderAmount: subtotal,
        cartItems,
      });
    },
    enabled: displayItems.length > 0,
    staleTime: 30000, // 30 seconds
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

  // ✅ Calculate shipping cost based on selected courier (frontend)
  const shippingCost = useMemo(() => {
    if (!shippingData) return 0;
    if (shippingData.isFreeShipping) return 0;
    if (!selectedCourier) return Number(shippingData.shippingCost ?? 0);
    return Number(selectedCourier.freight_charge ?? 0);
  }, [shippingData, selectedCourier]);

  // ✅ Recalculate GST and total based on selected courier
  const gstAmount = useMemo(() => {
    const taxableAmount = subtotal - discount + shippingCost;
    return taxableAmount * 0.18; // 18% GST
  }, [subtotal, discount, shippingCost]);

  const total = useMemo(() => {
    const taxableAmount = subtotal - discount + shippingCost;
    return taxableAmount + gstAmount;
  }, [subtotal, discount, shippingCost, gstAmount]);

  // Close autocomplete when clicking outside
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

  // Validate and apply coupon mutation
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
        // Apply coupon to cart store
        const couponData = {
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
        };
        applyCoupon(couponData);
        toast.success(`Coupon "${code}" applied successfully!`);
        setCouponCode("");
        setShowCouponDropdown(false);
        setShowAutocomplete(false);
        refetchCoupons(); // Refresh available coupons
      } else {
        toast.error(response.error || "Invalid coupon code");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to apply coupon");
    },
  });

  const updateQtyMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      return await cartApi.updateCartItem(itemId, { quantity });
    },
    onSuccess: async () => {
      await refetchCartApi();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update quantity");
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await cartApi.removeFromCart(itemId);
    },
    onSuccess: async () => {
      toast.success("Item removed");
      await refetchCartApi();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to remove item");
    },
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
    refetchCoupons(); // Refresh available coupons
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

  const getCourierLabel = (courier: any) => {
    if (!courier) return null;
    return `${courier.courier_name} • ${courier.estimated_delivery_days} days • ${formatMoney(courier.freight_charge)}`;
  };


  if (isLoadingCartApi) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Mobile Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="lg:hidden sticky top-0 z-50 bg-white shadow-sm px-4 py-4 flex items-center justify-between"
      >
        <Link href="/shop">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-lg font-bold">My Cart ({totalItems})</h1>
        <button
          onClick={() => setShowCouponDropdown(!showCouponDropdown)}
          className="text-sm text-amber-600 font-medium"
        >
          Coupons
        </button>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-12">
        {/* Desktop Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="hidden lg:block mb-8"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900">
              Shopping Cart
              <span className="text-2xl text-gray-500 font-normal ml-4">
                ({totalItems} {totalItems === 1 ? "Item" : "Items"})
              </span>
            </h1>
            <Link
              href="/shop"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        </motion.div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 mb-6 lg:mb-0">
            <AnimatePresence mode="popLayout">
              {displayItems.map((item: any, index: number) => {
                console.log("item", item);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link href={`/products/${item?.product?.slug}`}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="relative flex-shrink-0 cursor-pointer"
                        >
                          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden bg-gray-100">
                            {item?.product?.media ? (
                              <Image
                                src={item?.product?.media?.[0].url}
                                alt={item.product?.name}
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <ShoppingBag className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <Link href={`/products/${item?.product?.slug}`}>
                              <h3 className="font-bold text-gray-900 text-base lg:text-lg mb-1 hover:text-amber-600 transition cursor-pointer">
                                {item.product?.name}
                              </h3>
                            </Link>
                            {item?.variant && (
                              <div className="mt-2 space-y-2">
                                {/* ✅ Standard Variant fields */}
                                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                  {item.variant.color && (
                                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                                      {item.variant.color}
                                    </span>
                                  )}
                                  {item.variant.size && (
                                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                                      Size: {item.variant.size}
                                    </span>
                                  )}
                                  {item.variant.fabric && (
                                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                                      {item.variant.fabric}
                                    </span>
                                  )}
                                </div>

                                {/* ✅ Custom Attributes (dynamic key/value) */}
                                {normalizeAttributes(item.variant.attributes)
                                  .length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {normalizeAttributes(
                                      item.variant.attributes,
                                    ).map((attr) => (
                                      <span
                                        key={attr.key}
                                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100"
                                      >
                                        {attr.key}:{" "}
                                        <span className="font-semibold">
                                          {attr.value}
                                        </span>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {item?.stock < 5 && item?.stock > 0 && (
                              <p className="text-xs text-orange-600 mt-1">
                                Only {item?.stock?.[0].quantity} left in stock
                              </p>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (user?.id) {
                                removeItemMutation.mutate(item.id);
                              } else {
                                removeItem(item.id);
                              }
                            }}
                            className="text-gray-400 hover:text-red-500 transition p-1"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">
                              ₹{Number(item?.product?.sellingPrice).toFixed(2)}
                            </p>
                            {item.basePrice > item.price && (
                              <p className="text-sm text-gray-400 line-through">
                                ₹{Number(item?.product?.basePrice).toFixed(2)}
                              </p>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 lg:gap-3 bg-gray-100 rounded-full px-2 py-1">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                const newQty = item.quantity - 1;
                                if (newQty < 1) return;

                                if (user) {
                                  updateQtyMutation.mutate({
                                    itemId: item.id,
                                    quantity: newQty,
                                  });
                                } else {
                                  updateQuantity(item.id, newQty);
                                }
                              }}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>

                            <span className="w-8 text-center font-semibold text-gray-900">
                              {item.quantity}
                            </span>

                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                const newQty = item.quantity + 1;

                                if (user) {
                                  updateQtyMutation.mutate({
                                    itemId: item.id,
                                    quantity: newQty,
                                  });
                                } else {
                                  updateQuantity(item.id, newQty);
                                }
                              }}
                              disabled={item.quantity >= item.stock}
                              className="w-8 h-8 flex items-center justify-center text-white bg-black rounded-full hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24 space-y-6">
              {/* Coupon Section - API INTEGRATED */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Apply Coupon</h3>
                  {isLoadingCoupons && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-700">
                          {appliedCoupon.discountType === "PERCENTAGE"
                            ? `${appliedCoupon.discountValue}% OFF`
                            : `₹${appliedCoupon.discountValue} OFF`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-green-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Input with Autocomplete */}
                    <div className="relative" ref={dropdownRef}>
                      <div className="flex gap-2">
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
                              if (e.key === "Enter" && couponCode) {
                                handleApplyCoupon(couponCode);
                              }
                            }}
                            placeholder="Enter coupon code"
                            className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition uppercase"
                            disabled={validateCouponMutation.isPending}
                          />
                          <button
                            onClick={() => {
                              setShowAutocomplete(!showAutocomplete);
                              setShowCouponDropdown(!showCouponDropdown);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApplyCoupon(couponCode)}
                          disabled={
                            !couponCode || validateCouponMutation.isPending
                          }
                          className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {validateCouponMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="hidden sm:inline">Apply</span>
                            </>
                          ) : (
                            "Apply"
                          )}
                        </motion.button>
                      </div>

                      {/* Autocomplete Dropdown */}
                      <AnimatePresence>
                        {(showAutocomplete || showCouponDropdown) &&
                          filteredCoupons.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-96 overflow-y-auto"
                            >
                              {filteredCoupons.map((coupon, index) => {
                                const canApply =
                                  subtotal >= coupon.minOrderValue;
                                const savings = coupon.estimatedDiscount || 0;

                                return (
                                  <motion.button
                                    key={coupon.code}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() =>
                                      canApply && handleCouponSelect(coupon)
                                    }
                                    disabled={
                                      !canApply ||
                                      validateCouponMutation.isPending
                                    }
                                    className={`w-full text-left p-4 border-b last:border-b-0 transition ${
                                      canApply
                                        ? "hover:bg-amber-50 cursor-pointer"
                                        : "opacity-50 cursor-not-allowed bg-gray-50"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-bold text-gray-900 text-sm">
                                            {coupon.code}
                                          </span>
                                          <span className="text-xs bg-amber-400 text-gray-900 px-2 py-1 rounded-full font-semibold">
                                            {coupon.discountType ===
                                            "PERCENTAGE"
                                              ? `${coupon.discountValue}% OFF`
                                              : `₹${coupon.discountValue} OFF`}
                                          </span>
                                        </div>
                                        {coupon.description && (
                                          <p className="text-xs text-gray-600 mb-1">
                                            {coupon.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {!canApply && (
                                      <p className="text-xs text-red-600 font-medium">
                                        Add ₹
                                        {(
                                          coupon.minOrderValue - subtotal
                                        ).toFixed(2)}{" "}
                                        more to apply
                                      </p>
                                    )}
                                    {canApply && savings > 0 && (
                                      <p className="text-xs text-green-600 font-medium mt-1">
                                        ✓ Save ₹{savings.toFixed(2)} with this
                                        coupon
                                      </p>
                                    )}
                                  </motion.button>
                                );
                              })}
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={() => {
                        setShowCouponDropdown(!showCouponDropdown);
                        setShowAutocomplete(!showAutocomplete);
                      }}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                    >
                      <Percent className="w-4 h-4" />
                      {showCouponDropdown
                        ? "Hide available coupons"
                        : `View ${availableCoupons.length} available coupons`}
                    </button>

                    {availableCoupons.length === 0 && !isLoadingCoupons && (
                      <p className="text-xs text-gray-500 text-center py-2">
                        No coupons available for your cart
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ✅ Shipping Info Section */}
              {/* ✅ NEW: Courier Selection Section */}
              {shippingData && shippingData.serviceable && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">
                        Select Courier
                      </h3>
                    </div>
                    {isLoadingShipping && (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    )}
                  </div>

                  <div className="relative" ref={courierDropdownRef}>
                    <button
                      onClick={() =>
                        setShowCourierDropdown(!showCourierDropdown)
                      }
                      className="w-full p-3 border-2 border-gray-200 rounded-xl hover:border-gray-400 transition text-left flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {selectedCourier?.courier_name || "Select Courier"}
                        </p>
                        {selectedCourier && (
                          <p className="text-xs text-gray-500">
                            {selectedCourier.estimated_delivery_days} days •{" "}
                            {formatMoney(selectedCourier.freight_charge)}
                          </p>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${showCourierDropdown ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {showCourierDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto"
                        >
                          {/* Cheapest */}
                          {shippingData.cheapestCourier && (
                            <button
                              onClick={() => {
                                setSelectedCourier(
                                  shippingData.cheapestCourier,
                                );
                                setShowCourierDropdown(false);
                              }}
                              className={`w-full p-4 text-left border-b hover:bg-green-50 transition ${
                                selectedCourier?.courier_company_id ===
                                shippingData.cheapestCourier.courier_company_id
                                  ? "bg-green-50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                  CHEAPEST
                                </span>
                                {selectedCourier?.courier_company_id ===
                                  shippingData.cheapestCourier
                                    .courier_company_id && (
                                  <Check className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {shippingData.cheapestCourier.courier_name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {
                                  shippingData.cheapestCourier
                                    .estimated_delivery_days
                                }{" "}
                                days •{" "}
                                {formatMoney(
                                  shippingData.cheapestCourier.freight_charge,
                                )}
                              </p>
                            </button>
                          )}

                          {/* Fastest */}
                          {shippingData.fastestCourier &&
                            shippingData.fastestCourier.courier_company_id !==
                              shippingData.cheapestCourier
                                ?.courier_company_id && (
                              <button
                                onClick={() => {
                                  setSelectedCourier(
                                    shippingData.fastestCourier,
                                  );
                                  setShowCourierDropdown(false);
                                }}
                                className={`w-full p-4 text-left border-b hover:bg-blue-50 transition ${
                                  selectedCourier?.courier_company_id ===
                                  shippingData.fastestCourier.courier_company_id
                                    ? "bg-blue-50"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                    FASTEST
                                  </span>
                                  {selectedCourier?.courier_company_id ===
                                    shippingData.fastestCourier
                                      .courier_company_id && (
                                    <Check className="w-4 h-4 text-blue-600" />
                                  )}
                                </div>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {shippingData.fastestCourier.courier_name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {
                                    shippingData.fastestCourier
                                      .estimated_delivery_days
                                  }{" "}
                                  days •{" "}
                                  {formatMoney(
                                    shippingData.fastestCourier.freight_charge,
                                  )}
                                </p>
                              </button>
                            )}

                          {/* Other couriers */}
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
                                className={`w-full p-4 text-left border-b last:border-b-0 hover:bg-gray-50 transition ${
                                  selectedCourier?.courier_company_id ===
                                  courier.courier_company_id
                                    ? "bg-gray-50"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate">
                                      {courier.courier_name}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {courier.estimated_delivery_days} days •
                                      Rating {courier.rating}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-900">
                                      {formatMoney(courier.freight_charge)}
                                    </p>
                                    {selectedCourier?.courier_company_id ===
                                      courier.courier_company_id && (
                                      <Check className="w-4 h-4 text-gray-600" />
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
              <div className="space-y-4 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-semibold">{formatMoney(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">
                      -{formatMoney(discount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <div className="flex flex-col">
                    <span>Shipping</span>
                    {selectedCourier && (
                      <span className="text-xs text-blue-600">
                        {selectedCourier.courier_name}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold">
                    {!shippingData
                      ? "—"
                      : shippingData.isFreeShipping
                        ? "Free"
                        : formatMoney(shippingCost)}
                  </span>
                </div>

                {/* ✅ GST Line */}
                {gstAmount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span className="text-sm">
                      GST (18%)
                      <span className="text-xs ml-1 text-gray-400">incl.</span>
                    </span>
                    <span className="font-semibold text-sm">
                      {formatMoney(gstAmount)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatMoney(total)}
                    </span>
                    <p className="text-sm text-gray-500">incl. all taxes</p>
                  </div>
                </div>
                {discount > 0 && (
                  <p className="text-sm text-green-600 text-right">
                    You saved {formatMoney(discount)}
                  </p>
                )}
              </div>

              {/* Checkout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full bg-black text-white py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 group"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-sm text-gray-500 mt-4 flex items-center justify-center gap-1"
              >
                <Lock className="w-4 h-4" />
                Secure Checkout
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50 border-t">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">TOTAL</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{total.toFixed(2)}
            </p>
            {discount > 0 && (
              <p className="text-xs text-green-600">
                Saved ₹{Number(discount).toFixed(2)}
              </p>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckout}
            className="bg-black text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2"
          >
            Checkout
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Spacer for mobile */}
      <div className="h-24 lg:hidden" />
    </div>
  );
}
