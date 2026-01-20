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
import { CreateOrderDTO, orderApi } from "@/lib/api/order.api";
import { useCreateOrder, useVerifyPayment } from "@/hooks/useOrders";
import { couponApi, type Coupon } from "@/lib/api/coupon.api";

type PaymentMethod = "RAZORPAY" | "COD";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("RAZORPAY");
  const [isProcessing, setIsProcessing] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<any>(null);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();

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

  const addresses = addressesData || [];

  // Auto-select default address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((addr) => addr.isDefault);
      setSelectedAddress(defaultAddr || addresses[0]);
    }
  }, [addresses, selectedAddress]);

  const items = isBuyNowMode && buyNowItem ? [buyNowItem] : cartItems;

  // Fetch order preview
  const { data: orderPreview, isLoading: isLoadingPreview } = useQuery({
    queryKey: [
      "orderPreview",
      selectedAddress?.id,
      appliedCoupon?.code,
      buyNowItem?.productId,
      buyNowItem?.variantId,
      buyNowItem?.quantity,
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
      });

      return response.data;
    },
    enabled: !!selectedAddress,
    staleTime: 30000,
  });

  const subtotal = orderPreview?.breakdown.subtotal || 0;
  const discount = orderPreview?.breakdown.discount || 0;
  const couponDiscount = orderPreview?.breakdown.couponDiscount || 0;
  const shippingCost = orderPreview?.breakdown.shippingCost || 0;
  const gstAmount = orderPreview?.breakdown.gstAmount || 0;
  const total = orderPreview?.breakdown.total || 0;
  const estimatedDelivery = orderPreview?.estimatedDelivery || "3-5 days";
  const couponError = orderPreview?.couponError;

  // ✅ FIX: Use cart store discount first, then override with preview if available
const displayCouponDiscount =
  appliedCoupon?.discountAmount ?? orderPreview?.breakdown.couponDiscount ?? 0;


  console.log("displayCouponDiscount", displayCouponDiscount);

  // Fetch applicable coupons
  const {
    data: applicableCouponsData,
    isLoading: isLoadingCoupons,
    refetch: refetchCoupons,
  } = useQuery({
    queryKey: ["applicableCoupons", subtotal, items.length],
    queryFn: async () => {
      if (items.length === 0 || !user) return { data: [] };

      const cartItems = items.map((item: any) => ({
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
    enabled: items.length > 0 && !!user && subtotal > 0,
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
    setShowAutocomplete(!!couponCode);
  }, [couponCode]);

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

  // Validate and apply coupon
  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const cartItems = items.map((item: any) => ({
        productId: item.productId,
        categoryId: item.categoryId,
        quantity: item.quantity,
        price: item.price,
      }));

      return await couponApi.validateCoupon({
        code: code.toUpperCase(),
        orderAmount: subtotal,
        cartItems,
      });
    },
    onSuccess: async (response, code) => {
      if (response.valid && response.coupon && response.discount) {
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
        refetchCoupons();

        // ✅ refetch preview AFTER coupon stored
        await queryClient.refetchQueries({
          queryKey: ["orderPreview"],
        });
        refetchCoupons()
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
    toast.info("Coupon removed");
    refetchCoupons();
    await queryClient.invalidateQueries({ queryKey: ["orderPreview"] });
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
        method: {
          card: true,
          netbanking: true,
          wallet: true,
          upi: true,
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

    try {
      setIsProcessing(true);

      const backendPaymentMethod =
        paymentMethod === "RAZORPAY" ? "CARD" : "COD";

      const orderDTO: CreateOrderDTO = {
        shippingAddressId: selectedAddress.id,
        billingAddressId: selectedAddress.id,
        couponCode: appliedCoupon?.code,
        paymentMethod: backendPaymentMethod,
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

      const response = await createOrderMutation.mutateAsync(orderDTO);

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

  if (items.length === 0) {
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
                  Order Items ({items.length})
                </h2>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item: any, index: number) => (
                  <div
                    key={`${item.productId}-${item.variantId}-${index}`}
                    className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName || item.name || "Product"}
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

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">
                        {item.productName || item.name}
                      </p>

                      {item.variant && (
                        <p className="text-xs text-gray-500">
                          {[
                            item.variant.size,
                            item.variant.color,
                            item.variant.fabric,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                        <p className="font-semibold text-sm">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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

            {/* Payment Method */}
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
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setPaymentMethod("RAZORPAY")}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "RAZORPAY"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === "RAZORPAY"
                          ? "border-black bg-black"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === "RAZORPAY" && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <CreditCard className="w-6 h-6 text-gray-700" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        Online Payment
                      </p>
                      <p className="text-xs text-gray-500">
                        Card, UPI, Wallet & More
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">Powered by</span>
                      <span className="text-sm font-bold text-blue-600">
                        Razorpay
                      </span>
                    </div>
                  </div>
                </motion.div>
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
                          Saving ₹{displayCouponDiscount.toFixed(2)}
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
                            placeholder="Enter code"
                            className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition uppercase text-sm"
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
                              className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-72 overflow-y-auto"
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
                                    className={`w-full text-left p-3 border-b last:border-b-0 transition ${
                                      canApply
                                        ? "hover:bg-amber-50 cursor-pointer"
                                        : "opacity-50 cursor-not-allowed bg-gray-50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-gray-900 text-xs">
                                        {coupon.code}
                                      </span>
                                      <span className="text-xs bg-amber-400 text-gray-900 px-2 py-0.5 rounded-full font-semibold">
                                        {coupon.discountType === "PERCENTAGE"
                                          ? `${coupon.discountValue}% OFF`
                                          : `₹${coupon.discountValue} OFF`}
                                      </span>
                                    </div>
                                    {coupon.description && (
                                      <p className="text-xs text-gray-600 mb-1">
                                        {coupon.description}
                                      </p>
                                    )}
                                    {!canApply ? (
                                      <p className="text-xs text-red-600 font-medium">
                                        Add ₹
                                        {(
                                          coupon.minOrderValue - subtotal
                                        ).toFixed(2)}{" "}
                                        more
                                      </p>
                                    ) : (
                                      savings > 0 && (
                                        <p className="text-xs text-green-600 font-medium">
                                          ✓ Save ₹{savings.toFixed(2)}
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

                    <button
                      onClick={() => {
                        setShowCouponDropdown(!showCouponDropdown);
                        setShowAutocomplete(!showAutocomplete);
                      }}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                    >
                      <Percent className="w-4 h-4" />
                      {showCouponDropdown
                        ? "Hide coupons"
                        : `View ${availableCoupons.length} coupons`}
                    </button>

                    {availableCoupons.length === 0 && !isLoadingCoupons && (
                      <p className="text-xs text-gray-500 text-center py-2">
                        No coupons available
                      </p>
                    )}
                  </div>
                )}

                {couponError && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2">
                    {couponError}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  {isLoadingPreview ? (
                    <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <span className="font-semibold">
                      ₹{subtotal.toLocaleString()}
                    </span>
                  )}
                </div>

                {displayCouponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>-₹{displayCouponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <div className="flex flex-col">
                    <span>Shipping</span>
                    <span className="text-xs text-gray-500">
                      {estimatedDelivery}
                    </span>
                  </div>
                  {isLoadingPreview ? (
                    <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <span
                      className={`font-medium ${
                        shippingCost === 0 ? "text-green-600" : "text-gray-900"
                      }`}
                    >
                      {shippingCost === 0
                        ? "FREE"
                        : `₹${shippingCost.toFixed(2)}`}
                    </span>
                  )}
                </div>

                {gstAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span className="text-sm">
                      GST (18%)
                      <span className="text-xs ml-1 text-gray-400">incl.</span>
                    </span>
                    {isLoadingPreview ? (
                      <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      <span className="font-medium text-sm">
                        ₹{gstAmount.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="py-4 border-b border-gray-200">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  {isLoadingPreview ? (
                    <div className="h-9 w-28 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{total.toFixed(2)}
                    </span>
                  )}
                </div>
                {!isLoadingPreview && (
                  <>
                    <p className="text-sm text-gray-500 text-right">
                      Including GST of ₹{gstAmount.toFixed(2)}
                    </p>
                    {displayCouponDiscount > 0 && (
                      <p className="text-sm text-green-600 text-right mt-1">
                        You saved ₹{displayCouponDiscount.toLocaleString()}!
                      </p>
                    )}
                    {subtotal >= 1000 && shippingCost === 0 && (
                      <p className="text-sm text-green-600 text-right mt-1 flex items-center justify-end gap-1">
                        <span>🎉</span>
                        Free shipping applied!
                      </p>
                    )}
                  </>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={
                  !selectedAddress || isProcessing || !user || isLoadingPreview
                }
                className="w-full mt-6 bg-black text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                {isProcessing
                  ? "Processing..."
                  : !user
                    ? "Login to Place Order"
                    : isLoadingPreview
                      ? "Calculating..."
                      : "Place Order"}
              </motion.button>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Truck className="w-4 h-4" />
                  <span>Free delivery on all orders</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>100% secure payments</span>
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
