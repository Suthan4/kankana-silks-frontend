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
import { shippingApi } from "@/lib/api/shipping.api";

// Razorpay types
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

// ─── Step Indicator ──────────────────────────────────────────────────────────
const steps = [
  { id: 1, label: "Items", icon: ShoppingBag },
  { id: 2, label: "Address", icon: MapPin },
  { id: 3, label: "Payment", icon: CreditCard },
  { id: 4, label: "Summary", icon: Truck },
];

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const isBuyNowMode = searchParams.get("mode") === "buyNow";

  const { user, openModal } = useAuthModal();
  const {
    items: cartItems,
    appliedCoupon,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [activeStep, setActiveStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("CARD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<any>(null);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [courierPreference, setCourierPreference] =
    useState<CourierPreference>("CHEAPEST");
  const [showAllCouriers, setShowAllCouriers] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();
  const initiatePaymentMutation = useInitiatePayment();

  const paymentMethods = [
    {
      id: "CARD" as PaymentMethodType,
      name: "Card Payment",
      description: "Credit/Debit Card",
      emoji: "💳",
      requiresRazorpay: true,
    },
    {
      id: "NETBANKING" as PaymentMethodType,
      name: "Net Banking",
      description: "All major banks",
      emoji: "🏦",
      requiresRazorpay: true,
    },
    {
      id: "WALLET" as PaymentMethodType,
      name: "Wallet",
      description: "Paytm, PhonePe, Amazon Pay",
      emoji: "👛",
      requiresRazorpay: true,
    },
    {
      id: "COD" as PaymentMethodType,
      name: "Cash on Delivery",
      description: "Pay when you receive",
      emoji: "💵",
      requiresRazorpay: false,
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
  const displayItems =
    isBuyNowMode && buyNowItem ? [buyNowItem] : user ? apiItems : cartItems;
  const addresses = addressesData || [];

  const {
    data: shippingData,
    isLoading: isLoadingShipping,
    refetch: refetchShipping,
  } = useQuery({
    queryKey: ["cartShipping", selectedAddress?.pincode],
    queryFn: async () => {
      if (!selectedAddress?.pincode || displayItems.length === 0) return null;
      const response = await shippingApi.getCartShippingRates({
        deliveryPincode: selectedAddress?.pincode,
      });
      return response.data;
    },
    enabled: !!selectedAddress,
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
        .map((item: any) => `${item.productId}-${item.quantity}`)
        .join(","),
    ],
    queryFn: async () => {
      if (!selectedAddress) return null;
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
    enabled: !!selectedAddress && !!selectedCourier,
    staleTime: 0,
    gcTime: 0,
  });

  const subtotal = orderPreview?.breakdown.subtotal || 0;
  const discount = orderPreview?.breakdown.discount || 0;
  const couponDiscount = orderPreview?.breakdown.couponDiscount || 0;
  const shippingCost = orderPreview?.breakdown.shippingCost || 0;
  const cgstAmount = orderPreview?.breakdown.cgstAmount || 0;
  const sgstAmount = orderPreview?.breakdown.sgstAmount || 0;
  const gstAmount = orderPreview?.breakdown.gstAmount || 0;
  const shippingInfo = shippingData;
  const availableCouriers = shippingData?.availableCouriers ?? [];
  const cheapestCourier = shippingData?.cheapestCourier;
  const fastestCourier = shippingData?.fastestCourier;
  const chargeableWeight = shippingData?.chargeableWeight || 0;
  const isServiceable = shippingData?.serviceable ?? true;
  const isFreeShipping = shippingData?.isFreeShipping ?? shippingCost === 0;
  const total = orderPreview?.breakdown.total || 0;
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
    if (!selectedAddress?.pincode) return;
    if (eligibleCouriers.length > 0 && !selectedCourier) {
      const cheapest = eligibleCouriers.reduce((min: any, curr: any) =>
        curr.freight_charge < min.freight_charge ? curr : min,
      );
      setSelectedCourier(cheapest);
      setCourierPreference("CHEAPEST");
    }
  }, [eligibleCouriers, selectedCourier, selectedAddress?.pincode]);

  const getStockQty = (item: any) =>
    item?.variant?.stock?.[0]?.quantity ??
    item?.product?.stock?.find((s: any) => s.variantId === item?.variantId)
      ?.quantity ??
    0;
  const getUnitPrice = (item: any) =>
    Number(
      item?.variant?.sellingPrice ??
        item?.variant?.price ??
        item?.product?.sellingPrice ??
        item?.price ??
        0,
    );

  const {
    data: applicableCouponsData,
    isLoading: isLoadingCoupons,
    refetch: refetchCoupons,
  } = useQuery({
    queryKey: ["applicableCoupons", subtotal, displayItems.length],
    queryFn: async () => {
      if (!user || displayItems.length === 0 || !orderPreview || subtotal <= 0)
        return { data: [] };
      const cartItems = displayItems.map((item: any) => ({
        productId: item.productId,
        categoryId: item.categoryId,
        quantity: item.quantity,
        price: item.price,
      }));
      return await couponApi.getApplicableCoupons({
        orderAmount: subtotal,
        cartItems,
      });
    },
    enabled:
      !!user && displayItems.length > 0 && !!orderPreview && subtotal > 0,
    staleTime: 30000,
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
    onSuccess: async () => {
      await refetchCartApi();
      await queryClient.invalidateQueries({ queryKey: ["orderPreview"] });
      await refetchPreview();
    },
    onError: (err: any) =>
      toast.error(err?.message || "Failed to update quantity"),
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => await cartApi.removeFromCart(itemId),
    onSuccess: async () => {
      toast.success("Item removed");
      await refetchCartApi();
      await queryClient.invalidateQueries({ queryKey: ["orderPreview"] });
      await refetchPreview();
      await refetchCoupons();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to remove item"),
  });

  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const cartItemsForValidation = displayItems.map((item: any) => ({
        productId: item.productId,
        categoryId: item.categoryId,
        quantity: item.quantity,
        price: item.price,
      }));
      return await couponApi.validateCoupon({
        code: code.toUpperCase(),
        orderAmount: subtotal,
        cartItems: cartItemsForValidation,
      });
    },
    onSuccess: async (response, code) => {
      const payload = response?.data;
      if (payload.valid && payload.coupon && payload.discount !== undefined) {
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
          `Coupon "${code}" applied! You save ₹${Number(response.discount).toFixed(2)}`,
        );
        refetchCoupons();
      } else {
        toast.error(response.error || "Invalid coupon code");
      }
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to apply coupon"),
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

  const handleCourierSelect = (courier: any, preference: CourierPreference) => {
    setSelectedCourier(courier);
    setCourierPreference(preference);
    refetchPreview();
  };

  const getRazorpayBlock = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "CARD":
        return "block.card";
      case "NETBANKING":
        return "block.netbanking";
      case "WALLET":
        return "block.wallet";
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
              card: { name: "Pay via Card", instruments: [{ method: "card" }] },
              netbanking: {
                name: "Net Banking",
                instruments: [{ method: "netbanking" }],
              },
              wallet: { name: "Wallets", instruments: [{ method: "wallet" }] },
            },
            sequence: [getRazorpayBlock(paymentMethod)],
            preferences: { show_default_blocks: false },
          },
        },
        theme: { color: "#000000" },
        handler: async function (response: any) {
          try {
            await verifyPaymentMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (!isBuyNowMode) clearCart();
            else sessionStorage.removeItem("buyNowItem");
            toast.success("Payment successful! Order placed.");
            router.push("/my-account/orders");
          } catch (error) {
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
    if (paymentMethod === "COD" && !isCODAvailable) {
      toast.error("COD is only available for orders up to ₹2,000");
      return;
    }
    try {
      setIsProcessing(true);
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
      if (paymentMethod === "COD") {
        if (!isBuyNowMode) clearCart();
        else sessionStorage.removeItem("buyNowItem");
        toast.success("Order placed successfully!");
        router.push("/my-account/orders");
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

  if (displayItems.length === 0) return null;

  return (
    <div className="h-screen overflow-auto bg-gray-50 flex flex-col">
      {/* ─── Compact Header ───────────────────────────────────────────────── */}
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
                <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full flex items-center gap-1">
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

      {/* ─── Main Body ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto h-full px-4 py-4">
          <div className="grid lg:grid-cols-5 gap-4 h-full">
            {/* ── Left Column (3/5 width) ─────────────────────────────────── */}
            <div className="lg:col-span-3 flex flex-col gap-3 h-full overflow-auto">
              {/* Cart Items — fixed compact */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm flex-none"
              >
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                    <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-sm">
                    Order Items ({displayItems.length})
                  </h2>
                </div>

                <div className="p-3 space-y-2 max-h-36 overflow-y-auto">
                  {displayItems?.map((item: any, index: number) => {
                    const stockQty = getStockQty(item);
                    const unitPrice = getUnitPrice(item);
                    const isBuyNowItem = isBuyNowMode;
                    return (
                      <div
                        key={`${item.productId}-${item.variantId}-${index}`}
                        className="flex gap-2.5 p-2.5 bg-gray-50 rounded-lg relative"
                      >
                        {!isBuyNowItem && (
                          <button
                            onClick={() =>
                              user?.id
                                ? removeItemMutation.mutate(item.id)
                                : clearCart()
                            }
                            className="absolute top-2 right-2 p-1 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        )}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item?.product?.media?.[0]?.url ? (
                            <Image
                              src={item.product.media[0].url}
                              alt={item.product?.name}
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
                            {item.product?.name || item.name}
                          </p>
                          {item?.variant && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.variant.size && (
                                <span className="text-xs bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                                  Size: {item.variant.size}
                                </span>
                              )}
                              {item.variant.color && (
                                <span className="text-xs bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                                  {item.variant.color}
                                </span>
                              )}
                              {normalizeAttributes(item.variant.attributes).map(
                                (attr) => (
                                  <span
                                    key={attr.key}
                                    className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100"
                                  >
                                    {attr.key}: <b>{attr.value}</b>
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-1.5 py-0.5">
                              <button
                                disabled={isBuyNowItem || item.quantity <= 1}
                                onClick={() => {
                                  if (item.quantity > 1 && user?.id)
                                    updateQtyMutation.mutate({
                                      itemId: item.id,
                                      quantity: item.quantity - 1,
                                    });
                                }}
                                className="w-5 h-5 flex items-center justify-center text-gray-600 disabled:opacity-40 text-sm"
                              >
                                −
                              </button>
                              <span className="w-5 text-center text-xs font-bold">
                                {item.quantity}
                              </span>
                              <button
                                disabled={
                                  isBuyNowItem || item.quantity >= stockQty
                                }
                                onClick={() =>
                                  user?.id &&
                                  updateQtyMutation.mutate({
                                    itemId: item.id,
                                    quantity: item.quantity + 1,
                                  })
                                }
                                className="w-5 h-5 flex items-center justify-center bg-gray-900 text-white rounded-full disabled:opacity-40 text-sm"
                              >
                                +
                              </button>
                            </div>
                            <p className="font-bold text-xs text-gray-900">
                              ₹
                              {(unitPrice * item.quantity).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Address */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm flex-none"
              >
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-sm">
                    Delivery Address
                  </h2>
                </div>

                <div className="p-3">
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
                      {/* Scrollable address list */}
                      <div className="space-y-2 max-h-28 overflow-y-auto">
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
                                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0 rounded-full text-[10px]">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {address.addressLine1}
                                {address.addressLine2 &&
                                  `, ${address.addressLine2}`}
                                , {address.city}, {address.state} -{" "}
                                {address.pincode}
                              </p>
                              <p className="text-xs text-gray-500">
                                📞 {address.phone}
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
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm flex-none"
              >
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-sm">
                    Payment Method
                  </h2>
                </div>

                <div className="p-3 grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => {
                    const isCOD = method.id === "COD";
                    const isDisabled = isCOD && !isCODAvailable;
                    return (
                      <div
                        key={method.id}
                        onClick={() =>
                          !isDisabled && setPaymentMethod(method.id)
                        }
                        className={`p-2.5 border rounded-lg transition-all relative ${paymentMethod === method.id ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-400"} ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${paymentMethod === method.id ? "border-gray-900 bg-gray-900" : "border-gray-300"}`}
                          >
                            {paymentMethod === method.id && (
                              <Check className="w-2.5 h-2.5 text-white" />
                            )}
                          </div>
                          <span className="text-base">{method.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-xs leading-tight">
                              {method.name}
                            </p>
                            <p className="text-gray-400 text-[10px] leading-tight truncate">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        {isCOD && (
                          <p
                            className={`text-[10px] mt-1 font-medium pl-6 ${isCODAvailable ? "text-green-600" : "text-red-500"}`}
                          >
                            {isCODAvailable
                              ? "✅ Available"
                              : "❌ Up to ₹2,000 only"}
                          </p>
                        )}
                        {method.requiresRazorpay && (
                          <p className="text-[9px] text-gray-400 pl-6 mt-0.5">
                            via Razorpay
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* ── Right Column (2/5 width) ────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-2 flex flex-col h-full overflow-hidden"
            >
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="flex-none px-4 py-3 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 text-sm">
                    Order Summary
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                  {/* Coupon */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-4 h-4 text-amber-500" />
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
                              onChange={(e) =>
                                setCouponCode(e.target.value.toUpperCase())
                              }
                              onFocus={() => {
                                if (filteredCoupons.length > 0)
                                  setShowAutocomplete(true);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && couponCode)
                                  handleApplyCoupon(couponCode);
                              }}
                              placeholder="ENTER COUPON CODE"
                              className="w-full px-3 py-2 pr-7 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-medium uppercase placeholder:normal-case placeholder:text-gray-400 transition"
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

                        <AnimatePresence>
                          {(showAutocomplete || showCouponDropdown) &&
                            filteredCoupons.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute z-50 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto"
                              >
                                {filteredCoupons.map((coupon, index) => {
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
                                        <span className="text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                                          {coupon.discountType === "PERCENTAGE"
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
                        {availableCoupons.length === 0 && !isLoadingCoupons && (
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

                  {/* Courier Selection */}
                  <div>
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

                    {!selectedAddress ? (
                      <p className="text-xs text-gray-400">
                        Select an address first
                      </p>
                    ) : eligibleCouriers.length === 0 && !isLoadingShipping ? (
                      <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                        No courier available
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {chargeableWeight > 0 && (
                          <div className="text-[10px] bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-blue-700">
                            <Info className="w-3 h-3 flex-shrink-0" />
                            Chargeable Weight:{" "}
                            <span className="font-bold">
                              {chargeableWeight.toFixed(2)} kg
                            </span>
                          </div>
                        )}

                        {cheapestCourier && (
                          <div
                            onClick={() =>
                              handleCourierSelect(cheapestCourier, "CHEAPEST")
                            }
                            className={`p-2.5 border rounded-lg cursor-pointer transition-all ${selectedCourier?.courier_company_id === cheapestCourier.courier_company_id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"}`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedCourier?.courier_company_id === cheapestCourier.courier_company_id ? "border-green-500 bg-green-500" : "border-gray-300"}`}
                              >
                                {selectedCourier?.courier_company_id ===
                                  cheapestCourier.courier_company_id && (
                                  <Check className="w-2.5 h-2.5 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0 rounded-full font-bold">
                                      CHEAPEST
                                    </span>
                                    <p className="font-semibold text-gray-900 text-xs mt-0.5">
                                      {cheapestCourier.courier_name}
                                    </p>
                                  </div>
                                  <p className="font-bold text-green-600 text-sm">
                                    {formatMoney(
                                      cheapestCourier.freight_charge,
                                    )}
                                  </p>
                                </div>
                                <p className="text-[10px] text-gray-500">
                                  {cheapestCourier.estimated_delivery_days} days
                                  • ⭐ {cheapestCourier.rating}
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
                              className={`p-2.5 border rounded-lg cursor-pointer transition-all ${selectedCourier?.courier_company_id === fastestCourier.courier_company_id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedCourier?.courier_company_id === fastestCourier.courier_company_id ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
                                >
                                  {selectedCourier?.courier_company_id ===
                                    fastestCourier.courier_company_id && (
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0 rounded-full font-bold">
                                        FASTEST
                                      </span>
                                      <p className="font-semibold text-gray-900 text-xs mt-0.5">
                                        {fastestCourier.courier_name}
                                      </p>
                                    </div>
                                    <p className="font-bold text-blue-600 text-sm">
                                      {formatMoney(
                                        fastestCourier.freight_charge,
                                      )}
                                    </p>
                                  </div>
                                  <p className="text-[10px] text-gray-500">
                                    {fastestCourier.estimated_delivery_days}{" "}
                                    days • ⭐ {fastestCourier.rating}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {eligibleCouriers.length > 2 && (
                          <button
                            onClick={() => setShowAllCouriers(!showAllCouriers)}
                            className="text-xs text-blue-600 font-semibold flex items-center gap-1 w-full justify-center"
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
                                    <p className="text-[10px] text-gray-500">
                                      {courier.estimated_delivery_days} days •
                                      ⭐ {courier.rating}
                                    </p>
                                  </div>
                                ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                      {isLoadingPreview ? (
                        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
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
                      {isLoadingPreview ? (
                        <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
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

                {/* ─── Sticky Total + CTA ───────────────────────────────── */}
                <div className="flex-none border-t border-gray-200 px-4 py-3 bg-white">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="font-bold text-gray-900 text-sm">
                      Total
                    </span>
                    {isLoadingPreview ? (
                      <div className="h-7 w-28 bg-gray-200 animate-pulse rounded" />
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
                      !selectedAddress ||
                      isProcessing ||
                      !user ||
                      isLoadingPreview ||
                      !isServiceable ||
                      isErrorOrderPreview
                    }
                    className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    <Lock className="w-4 h-4" />
                    {!isServiceable
                      ? "Delivery Not Available"
                      : isProcessing
                        ? "Processing..."
                        : !user
                          ? "Login to Place Order"
                          : isLoadingPreview
                            ? "Calculating..."
                            : `Place Order — ₹${total.toLocaleString()}`}
                  </motion.button>
                </div>
              </div>
            </motion.div>
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
    </div>
  );
}