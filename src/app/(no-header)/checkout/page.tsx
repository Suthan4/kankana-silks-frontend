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

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("CARD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<any>(null);

  // ✅ NEW: Courier selection state
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [courierPreference, setCourierPreference] =
    useState<CourierPreference>("CHEAPEST");
  const [showAllCouriers, setShowAllCouriers] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();
  const initiatePaymentMutation = useInitiatePayment();

  // ✅ Payment method options with COD
  const paymentMethods = [
    {
      id: "CARD" as PaymentMethodType,
      name: "Card Payment",
      description: "Credit/Debit Card",
      emoji: "💳",
      requiresRazorpay: true,
    },
    {
      id: "UPI" as PaymentMethodType,
      name: "UPI",
      description: "Google Pay, PhonePe, Paytm",
      emoji: "📱",
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

  // Load items based on mode
  useEffect(() => {
    if (isBuyNowMode) {
      const storedItem = sessionStorage.getItem("buyNowItem");
      if (storedItem) {
        try {
          const item = JSON.parse(storedItem);
          setBuyNowItem(item);
        } catch (error) {
          console.error("Error loading buy now item:", error);
          router.push("/cart");
        }
      } else {
        router.push("/cart");
      }
    }
  }, [isBuyNowMode, router]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch addresses
  const { data: addressesData, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      const response = await addressApi.getAddresses();
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
      return res.data;
    },
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

  // Auto-select default address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((addr) => addr.isDefault);
      setSelectedAddress(defaultAddr || addresses[0]);
    }
  }, [addresses, selectedAddress]);

  // Fetch order preview
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
  console.log("selectedCourier?.courier_company_id", selectedCourier);

  const subtotal = orderPreview?.breakdown.subtotal || 0;
  const discount = orderPreview?.breakdown.discount || 0;
  const couponDiscount = orderPreview?.breakdown.couponDiscount || 0;
  const shippingCost = orderPreview?.breakdown.shippingCost || 0;
  const gstAmount = orderPreview?.breakdown.gstAmount || 0;
  const shippingInfo = shippingData; // ✅ couriers source
  const availableCouriers = shippingData?.availableCouriers ?? [];
  const cheapestCourier = shippingData?.cheapestCourier;
  const fastestCourier = shippingData?.fastestCourier;
  const chargeableWeight = shippingData?.chargeableWeight || 0;
  const isServiceable = shippingData?.serviceable ?? true;
  const isFreeShipping = shippingData?.isFreeShipping ?? shippingCost === 0;
  const total = orderPreview?.breakdown.total || 0;
  const estimatedDelivery = orderPreview?.estimatedDelivery || "3-5 days";
  const couponError = orderPreview?.couponError;

  // ✅ COD availability check
  const isCODAvailable = total > 0 && total <= 2000;

  // ✅ Filter couriers by weight capacity
  const eligibleCouriers = useMemo(() => {
    if (!availableCouriers || availableCouriers.length === 0) return [];

    return availableCouriers.filter((courier: any) => {
      // If courier name contains weight info, check it
      const courierName = courier.courier_name?.toLowerCase() || "";

      // Amazon Shipping Surface 1kg - only for orders ≤ 1kg
      if (courierName.includes("amazon") && courierName.includes("1kg")) {
        return chargeableWeight <= 1;
      }

      // Add more weight-based filters if needed
      // Example: if (courierName.includes("2kg")) return chargeableWeight <= 2;

      return true; // Allow all other couriers
    });
  }, [availableCouriers, chargeableWeight]);

  // ✅ Auto-select courier on load
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

  const getStockQty = (item: any) => {
    return (
      item?.variant?.stock?.[0]?.quantity ??
      item?.product?.stock?.find((s: any) => s.variantId === item?.variantId)
        ?.quantity ??
      0
    );
  };

  const getUnitPrice = (item: any) => {
    return Number(
      item?.variant?.sellingPrice ??
        item?.variant?.price ??
        item?.product?.sellingPrice ??
        item?.price ??
        0,
    );
  };

  // Fetch applicable coupons (existing code...)
  const {
    data: applicableCouponsData,
    isLoading: isLoadingCoupons,
    refetch: refetchCoupons,
  } = useQuery({
    queryKey: ["applicableCoupons", subtotal, displayItems.length],
    queryFn: async () => {
      if (
        !user ||
        displayItems.length === 0 ||
        !orderPreview ||
        subtotal <= 0
      ) {
        return { data: [] };
      }

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

  const availableCoupons = useMemo(() => {
    return applicableCouponsData?.data ?? [];
  }, [applicableCouponsData?.data]);

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

  // Update quantity mutation (existing code...)
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
      await queryClient.invalidateQueries({
        queryKey: ["orderPreview"],
      });
      await refetchPreview();
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
      await queryClient.invalidateQueries({
        queryKey: ["orderPreview"],
      });
      await refetchPreview();
      await refetchCoupons();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to remove item");
    },
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
        const couponData = {
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
        };

        applyCoupon(couponData);
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
    onError: (error: any) => {
      toast.error(error.message || "Failed to apply coupon");
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

    await queryClient.invalidateQueries({
      queryKey: ["orderPreview"],
    });
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
    onError: () => {
      toast.error("Failed to delete address");
    },
  });

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

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
    if (selectedAddress?.id === addressId) {
      setSelectedAddress(null);
    }
    deleteAddressMutation.mutate(addressId);
  };

  // ✅ Handle courier selection
  const handleCourierSelect = (courier: any, preference: CourierPreference) => {
    setSelectedCourier(courier);
    setCourierPreference(preference);
    // ✅ update pricing based on courier
    refetchPreview();
  };;
const getRazorpayBlock = (paymentMethod: string) => {
  switch (paymentMethod) {
    case "UPI":
      return "block.upi";
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
              upi: {
                name: "Pay via UPI",
                instruments: [{ method: "upi" }],
              },
              card: {
                name: "Pay via Card",
                instruments: [{ method: "card" }],
              },
              netbanking: {
                name: "Net Banking",
                instruments: [{ method: "netbanking" }],
              },
              wallet: {
                name: "Wallets",
                instruments: [{ method: "wallet" }],
              },
            },
            sequence: [getRazorpayBlock(paymentMethod)],
            preferences: {
              show_default_blocks: false, // 🚫 hides Pay Later
            },
          },
        },
        theme: {
          color: "#000000",
        },
        handler: async function (response: any) {
          try {
            await verifyPaymentMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!isBuyNowMode) {
              clearCart();
            } else {
              sessionStorage.removeItem("buyNowItem");
            }
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

    // ✅ COD validation
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
        // ✅ Pass courier selection
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
        if (!isBuyNowMode) {
          clearCart();
        } else {
          sessionStorage.removeItem("buyNowItem");
        }
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

  const getCourierLabel = (courier: any) => {
    if (!courier) return null;
    return `${courier.courier_name} • ${courier.estimated_delivery_days} days • ${formatMoney(courier.freight_charge)}`;
  };

  console.log("shippingInfo", JSON.stringify(shippingInfo));
  console.log("orderPreview?.breakdown.shippingCost", orderPreview?.breakdown);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/cart">
            <motion.button
              whileHover={{ x: -4 }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Cart
            </motion.button>
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Checkout
          </h1>
          {isBuyNowMode && (
            <p className="text-sm text-orange-600 flex items-center gap-2 mt-1">
              <Zap className="w-4 h-4" />
              Express Checkout - Buy Now
            </p>
          )}
          <p className="text-gray-600 mt-2">Review and complete your order</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Order Items ({displayItems.length})
                </h2>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {displayItems?.map((item: any, index: number) => {
                  const stockQty = getStockQty(item);
                  const unitPrice = getUnitPrice(item);

                  const isBuyNowItem = isBuyNowMode;

                  return (
                    <div
                      key={`${item.productId}-${item.variantId}-${index}`}
                      className="flex gap-3 p-3 bg-gray-50 rounded-xl relative"
                    >
                      {/* ✅ Delete Button */}
                      {!isBuyNowItem && (
                        <button
                          onClick={() => {
                            if (user?.id) {
                              removeItemMutation.mutate(item.id);
                            } else {
                              clearCart(); // OR remove item from zustand if you have removeItem
                            }
                          }}
                          className="absolute top-2 right-2 p-2 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}

                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item?.product?.media?.[0]?.url ? (
                          <Image
                            src={item.product.media[0].url}
                            alt={item.product?.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm line-clamp-1">
                          {item.product?.name || item.name}
                        </p>

                        {/* ✅ Variant + Custom attrs */}
                        {item?.variant && (
                          <div className="mt-2 space-y-2">
                            {/* normal */}
                            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                              {item.variant.size && (
                                <span className="bg-gray-100 px-2 py-0.5 rounded">
                                  Size: {item.variant.size}
                                </span>
                              )}
                              {item.variant.color && (
                                <span className="bg-gray-100 px-2 py-0.5 rounded">
                                  {item.variant.color}
                                </span>
                              )}
                              {item.variant.fabric && (
                                <span className="bg-gray-100 px-2 py-0.5 rounded">
                                  {item.variant.fabric}
                                </span>
                              )}
                            </div>

                            {/* custom */}
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

                        {/* Qty + Price */}
                        <div className="flex items-center justify-between mt-3">
                          {/* ✅ Qty Controls */}
                          <div className="flex items-center gap-2 bg-white border rounded-full px-2 py-1">
                            <button
                              disabled={isBuyNowItem || item.quantity <= 1}
                              onClick={() => {
                                const newQty = item.quantity - 1;
                                if (newQty < 1) return;

                                if (user?.id) {
                                  updateQtyMutation.mutate({
                                    itemId: item.id,
                                    quantity: newQty,
                                  });
                                } else {
                                  // zustand update
                                  // updateQuantity(item.id, newQty)
                                }
                              }}
                              className="w-7 h-7 flex items-center justify-center disabled:opacity-50"
                            >
                              -
                            </button>

                            <span className="w-6 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>

                            <button
                              disabled={
                                isBuyNowItem || item.quantity >= stockQty
                              }
                              onClick={() => {
                                const newQty = item.quantity + 1;

                                if (user?.id) {
                                  updateQtyMutation.mutate({
                                    itemId: item.id,
                                    quantity: newQty,
                                  });
                                } else {
                                  // zustand update
                                  // updateQuantity(item.id, newQty)
                                }
                              }}
                              className="w-7 h-7 flex items-center justify-center bg-black text-white rounded-full disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>

                          {/* ✅ Price */}
                          <p className="font-semibold text-sm">
                            ₹
                            {(unitPrice * item.quantity).toLocaleString(
                              "en-IN",
                            )}
                          </p>
                        </div>

                        {/* ✅ Stock info */}
                        <p className="text-xs text-gray-500 mt-1">
                          Stock: {stockQty}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Delivery Address
                </h2>
              </div>

              {!user ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Please login to add delivery address
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal("login")}
                    className="px-6 py-3 bg-black text-white rounded-full font-semibold"
                  >
                    Login to Continue
                  </motion.button>
                </div>
              ) : isLoadingAddresses ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="p-4 border-2 border-gray-200 rounded-xl animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddNewAddress}
                  className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-black transition-colors"
                >
                  <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="font-semibold text-gray-700">
                    Add Delivery Address
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Click to add your first address
                  </p>
                </motion.button>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {addresses.map((address) => (
                      <motion.div
                        key={address.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => handleAddressSelect(address)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedAddress?.id === address.id
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selectedAddress?.id === address.id
                                  ? "border-black bg-black"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedAddress?.id === address.id && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900">
                                  {address.fullName}
                                </p>
                                {address.isDefault && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {address.addressLine1}
                                {address.addressLine2 &&
                                  `, ${address.addressLine2}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state} -{" "}
                                {address.pincode}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Phone: {address.phone}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(address);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(address.id);
                              }}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddNewAddress}
                    className="w-full py-3 border-2 border-gray-300 rounded-xl hover:border-black transition-colors flex items-center justify-center gap-2 text-gray-700 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Add New Address
                  </motion.button>
                </>
              )}
            </motion.div>

            {/* Payment Method with COD restriction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isCOD = method.id === "COD";
                  const isDisabled = isCOD && !isCODAvailable;

                  return (
                    <motion.div
                      key={method.id}
                      whileHover={!isDisabled ? { scale: 1.01 } : {}}
                      onClick={() => !isDisabled && setPaymentMethod(method.id)}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        paymentMethod === method.id
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-400"
                      } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === method.id
                              ? "border-black bg-black"
                              : "border-gray-300"
                          }`}
                        >
                          {paymentMethod === method.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-2xl">{method.emoji}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {method.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {method.description}
                          </p>
                          {isCOD && (
                            <p
                              className={`text-xs mt-1 font-medium ${
                                isCODAvailable
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {isCODAvailable
                                ? "✅ Available for this order"
                                : "❌ Available only for orders up to ₹2,000"}
                            </p>
                          )}
                        </div>
                        {method.requiresRazorpay && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">via</span>
                            <span className="text-xs font-bold text-blue-600">
                              Razorpay
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-200 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Coupon Section */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Apply Coupon</h3>
                  {(isLoadingCoupons || validateCouponMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-green-900 text-sm">
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
                        className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                        disabled={validateCouponMutation.isPending}
                      >
                        <X className="w-5 h-5 text-green-600" />
                      </button>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t border-green-200">
                        <span className="text-xs text-green-700 font-medium">
                          You're saving:
                        </span>
                        <span className="text-sm font-bold text-green-700">
                          ₹{couponDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
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
                              if (filteredCoupons.length > 0)
                                setShowAutocomplete(true);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && couponCode) {
                                handleApplyCoupon(couponCode);
                              }
                            }}
                            placeholder="Enter coupon code"
                            className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition uppercase text-sm font-medium"
                            disabled={validateCouponMutation.isPending}
                          />
                          <button
                            onClick={() => {
                              setShowAutocomplete(!showAutocomplete);
                              setShowCouponDropdown(!showCouponDropdown);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <ChevronDown
                              className={`w-5 h-5 transition-transform ${showCouponDropdown ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApplyCoupon(couponCode)}
                          disabled={
                            !couponCode || validateCouponMutation.isPending
                          }
                          className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                        >
                          {validateCouponMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
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
                              className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto"
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
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <span className="font-bold text-gray-900 text-sm">
                                        {coupon.code}
                                      </span>
                                      <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2.5 py-1 rounded-full font-bold">
                                        {coupon.discountType === "PERCENTAGE"
                                          ? `${coupon.discountValue}% OFF`
                                          : `₹${coupon.discountValue} OFF`}
                                      </span>
                                    </div>
                                    {coupon.description && (
                                      <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                                        {coupon.description}
                                      </p>
                                    )}
                                    {!canApply ? (
                                      <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                                        <span>⚠️</span>
                                        Add ₹
                                        {(
                                          coupon.minOrderValue - subtotal
                                        ).toFixed(2)}{" "}
                                        more to apply
                                      </p>
                                    ) : (
                                      savings > 0 && (
                                        <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                                          <span>✓</span>
                                          Save ₹{savings.toFixed(2)}
                                        </p>
                                      )
                                    )}
                                  </motion.button>
                                );
                              })}
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </div>

                    {availableCoupons.length > 0 && (
                      <button
                        onClick={() => {
                          setShowCouponDropdown(!showCouponDropdown);
                          setShowAutocomplete(!showAutocomplete);
                        }}
                        className="text-sm text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Percent className="w-4 h-4" />
                        {showCouponDropdown
                          ? "Hide coupons"
                          : `View ${availableCoupons.length} available coupon${availableCoupons.length !== 1 ? "s" : ""}`}
                      </button>
                    )}

                    {availableCoupons.length === 0 && !isLoadingCoupons && (
                      <p className="text-xs text-gray-500 text-center py-3 bg-gray-50 rounded-lg">
                        No coupons available for your cart
                      </p>
                    )}
                  </div>
                )}

                {couponError && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg mt-3 flex items-start gap-2">
                    <span className="text-base">⚠️</span>
                    <span>{couponError}</span>
                  </div>
                )}
              </div>

              {/* ✅ NEW: Courier Selection Section */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">
                      Select Courier
                    </h3>
                  </div>
                  {isLoadingPreview && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>

                {!orderPreview ? (
                  <p className="text-sm text-gray-500">
                    Select an address to see courier options
                  </p>
                ) : eligibleCouriers.length === 0 ? (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                    No courier available for this order
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Weight info */}
                    <div className="text-xs bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                      <Info className="w-4 h-4 inline mr-1" />
                      Chargeable Weight:{" "}
                      <span className="font-bold">
                        {chargeableWeight.toFixed(2)} kg
                      </span>
                    </div>

                    {/* Cheapest Courier */}
                    {cheapestCourier && (
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        onClick={() =>
                          handleCourierSelect(cheapestCourier, "CHEAPEST")
                        }
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedCourier?.courier_company_id ===
                          cheapestCourier.courier_company_id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedCourier?.courier_company_id ===
                              cheapestCourier.courier_company_id
                                ? "border-green-500 bg-green-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedCourier?.courier_company_id ===
                              cheapestCourier.courier_company_id && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                CHEAPEST
                              </span>
                            </div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {cheapestCourier.courier_name}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-600">
                                {cheapestCourier.estimated_delivery_days} days •
                                Rating {cheapestCourier.rating}
                              </p>
                              <p className="font-bold text-green-600">
                                {formatMoney(cheapestCourier.freight_charge)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Fastest Courier */}
                    {fastestCourier &&
                      fastestCourier.courier_company_id !==
                        cheapestCourier?.courier_company_id && (
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          onClick={() =>
                            handleCourierSelect(fastestCourier, "FASTEST")
                          }
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedCourier?.courier_company_id ===
                            fastestCourier.courier_company_id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selectedCourier?.courier_company_id ===
                                fastestCourier.courier_company_id
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedCourier?.courier_company_id ===
                                fastestCourier.courier_company_id && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                  FASTEST
                                </span>
                              </div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {fastestCourier.courier_name}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-600">
                                  {fastestCourier.estimated_delivery_days} days
                                  • Rating {fastestCourier.rating}
                                </p>
                                <p className="font-bold text-blue-600">
                                  {formatMoney(fastestCourier.freight_charge)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                    {/* Show more couriers */}
                    {eligibleCouriers.length > 2 && (
                      <button
                        onClick={() => setShowAllCouriers(!showAllCouriers)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 transition-colors w-full justify-center"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${showAllCouriers ? "rotate-180" : ""}`}
                        />
                        {showAllCouriers
                          ? "Hide other couriers"
                          : `View ${eligibleCouriers.length - 2} more courier${eligibleCouriers.length - 2 !== 1 ? "s" : ""}`}
                      </button>
                    )}

                    {/* All couriers list */}
                    <AnimatePresence>
                      {showAllCouriers && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 max-h-60 overflow-y-auto"
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
                              <motion.div
                                key={courier.id}
                                whileHover={{ scale: 1.01 }}
                                onClick={() =>
                                  handleCourierSelect(courier, "CUSTOM")
                                }
                                className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                  selectedCourier?.courier_company_id ===
                                  courier.courier_company_id
                                    ? "border-black bg-gray-50"
                                    : "border-gray-200 hover:border-gray-400"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                      selectedCourier?.courier_company_id ===
                                      courier.courier_company_id
                                        ? "border-black bg-black"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {selectedCourier?.courier_company_id ===
                                      courier.courier_company_id && (
                                      <Check className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate">
                                      {courier.courier_name}
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                      <p className="text-xs text-gray-600">
                                        {courier.estimated_delivery_days} days •
                                        Rating {courier.rating}
                                      </p>
                                      <p className="font-bold text-gray-900">
                                        {formatMoney(courier.freight_charge)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      Subtotal ({displayItems.length}{" "}
                      {displayItems.length === 1 ? "item" : "items"})
                    </span>
                    {isLoadingPreview ? (
                      <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      <span className="font-semibold text-gray-900">
                        ₹{subtotal.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {couponDiscount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between text-green-600 font-semibold bg-green-50 -mx-2 px-2 py-1.5 rounded"
                    >
                      <span className="flex items-center gap-1">
                        <Gift className="w-4 h-4" />
                        Coupon ({appliedCoupon?.code})
                      </span>
                      <span>-₹{couponDiscount.toLocaleString()}</span>
                    </motion.div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <div className="flex flex-col">
                      <span>Shipping</span>
                      <span className="text-xs text-gray-500">
                        {estimatedDelivery}
                      </span>
                    </div>
                    {isLoadingPreview ? (
                      <div className="h-5 w-16 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      <span
                        className={`font-semibold ${
                          shippingCost === 0
                            ? "text-green-600"
                            : "text-gray-900"
                        }`}
                      >
                        {isFreeShipping
                          ? "FREE"
                          : `₹${shippingCost.toFixed(2)}`}
                      </span>
                    )}
                  </div>

                  {gstAmount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span className="text-sm">
                        GST (18%)
                        <span className="text-xs ml-1 text-gray-400">
                          incl.
                        </span>
                      </span>
                      {isLoadingPreview ? (
                        <div className="h-5 w-16 bg-gray-200 animate-pulse rounded" />
                      ) : (
                        <span className="font-semibold text-sm text-gray-900">
                          {/* ₹{gstAmount.toFixed(2)}.  */}₹{" "}
                          {gstAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="py-4 border-b border-gray-200">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    {isLoadingPreview ? (
                      <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">
                        ₹
                        {total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    )}
                  </div>
                  {!isLoadingPreview && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 text-right">
                        Including GST of ₹{gstAmount.toFixed(2)}
                      </p>
                      {couponDiscount > 0 && (
                        <p className="text-sm text-green-600 text-right font-bold flex items-center justify-end gap-1">
                          <span>🎉</span>
                          You saved ₹{couponDiscount.toLocaleString()}!
                        </p>
                      )}
                      {isFreeShipping && (
                        <p className="text-sm text-green-600 text-right font-semibold flex items-center justify-end gap-1">
                          <Truck className="w-4 h-4" />
                          Free shipping applied!
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlaceOrder}
                  disabled={
                    !selectedAddress ||
                    isProcessing ||
                    !user ||
                    isLoadingPreview ||
                    !isServiceable ||
                    isErrorOrderPreview
                  }
                  className="w-full mt-6 bg-gradient-to-r from-gray-900 to-black text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  {!isServiceable
                    ? "Delivery Not Available"
                    : isProcessing
                      ? "Processing..."
                      : !user
                        ? "Login to Place Order"
                        : isLoadingPreview
                          ? "Calculating..."
                          : `Place Order - ₹${total.toLocaleString()}`}
                </motion.button>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Lock className="w-4 h-4" />
                    <span>100% secure payments</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Address Modal */}
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
