"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { shipmentApi } from "@/lib/api/shipment.api";
import { cartApi } from "@/lib/api/cart.api";
import { useCreateOrder, useVerifyPayment } from "@/hooks/useOrders";

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
  // Detect Buy Now mode
  const isBuyNowMode = searchParams.get("mode") === "buyNow";

  const { user, openModal } = useAuthModal();
  const {
    items: cartItems,
    getSubtotal,
    getDiscount,
    getTotal,
    appliedCoupon,
    clearCart,
  } = useCartStore();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [estimatedDelivery, setEstimatedDelivery] = useState("3-5 days");
  const [buyNowItem, setBuyNowItem] = useState<any>(null);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);

  // Determine which items to show
  const items = isBuyNowMode && buyNowItem ? [buyNowItem] : cartItems;
  const subtotal =
    isBuyNowMode && buyNowItem
      ? buyNowItem.price * buyNowItem.quantity
      : getSubtotal();
  const discount = isBuyNowMode ? 0 : getDiscount();
  const total = subtotal - discount + shippingCost + gstAmount;
  // Mutations
  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();

  // Load items based on mode
  useEffect(() => {
    if (isBuyNowMode) {
      setIsBuyNowLoading(true);

      // Load buy now item from session storage
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
  }, [isBuyNowMode, cartItems, router]);

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

  // Fetch addresses from API (only when user is logged in)
  const { data: addressesData, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      const response = await addressApi.getAddresses();
      return response.data;
    },
    enabled: !!user,
  });

  const addresses = addressesData || [];

  // Auto-select default address or first address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((addr) => addr.isDefault);
      setSelectedAddress(defaultAddr || addresses[0]);
    }
  }, [addresses, selectedAddress]);

  // Calculate shipping and GST when address changes
  useEffect(() => {
    const calculateShippingAndGST = async () => {
      if (!selectedAddress) {
        setShippingCost(0);
        setGstAmount(0);
        setEstimatedDelivery("3-5 days");
        return;
      }

      try {
        const calculation = await shipmentApi.getOrderCalculation({
          deliveryPincode: selectedAddress.pincode,
          subtotal,
          discount,
          couponCode: appliedCoupon?.code,
        });

        setShippingCost(calculation.shippingCost);
        setGstAmount(calculation.gst.totalGst);
        setEstimatedDelivery(calculation.estimatedDelivery);

        if (!calculation.isServiceable) {
          toast.error(
            "Delivery not available to this pincode. Please select another address.",
          );
        }
      } catch (error) {
        console.error("Error calculating shipping:", error);
        // Use default values on error
        setShippingCost(subtotal >= 1000 ? 0 : 50);
        const gst = (subtotal - discount) * 0.18;
        setGstAmount(gst);
      }
    };

    calculateShippingAndGST();
  }, [selectedAddress, subtotal, discount, appliedCoupon]);

  // Delete address mutation
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
    // If user is not logged in, show login modal
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

  // Handle Razorpay payment
  const handleRazorpayPayment = async (orderData: any) => {
    console.log("orderData", orderData);
    
    try {
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amountInPaise, // Convert to paise
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
        theme: {
          color: "#000000",
        },
        handler: async function (response: any) {
          try {
            // Verify payment
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

      // Map payment method to backend enum
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
        // COD order created successfully
        if (!isBuyNowMode) {
          clearCart();
        } else {
          sessionStorage.removeItem("buyNowItem");
        }
        toast.success("Order placed successfully!");
        router.push("/my-account/orders");
      } else {
        // Open Razorpay for online payment
        await handleRazorpayPayment(response.data);
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast.error(error.message || "Failed to place order");
      setIsProcessing(false);
    }
  };

  const handleOrderSuccess = () => {
    // Clear buy now session data
    if (isBuyNowMode) {
      sessionStorage.removeItem("buyNowItem");
      sessionStorage.removeItem("buyNowData");
      sessionStorage.removeItem("pendingAction");
    } else {
      // Clear regular cart
      clearCart();
    }

    // Clear other session storage
    sessionStorage.removeItem("checkoutAfterLogin");

    // Redirect to orders
    router.push("/my-account/orders");
  };

  console.log("editingAddress", editingAddress);
  // Allow viewing checkout page without login
  if (items.length === 0) {
    return null;
  }
  console.log("buyNowItem", buyNowItem);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show mode indicator */}
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
          {/* Left Column - Main Content */}
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
                {items.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.variantId}-${index}`}
                    className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName || "Product image"}
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
                        {item.productName}
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
                {/* Cash on Delivery */}
                {/* <motion.div
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "COD"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === "COD"
                          ? "border-black bg-black"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === "COD" && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-2xl">💵</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        Cash on Delivery
                      </p>
                      <p className="text-xs text-gray-500">
                        Pay when you receive
                      </p>
                    </div>
                  </div>
                </motion.div> */}

                {/* Razorpay - Online Payment */}
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

          {/* Right Column - Order Summary (Sticky) */}
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

              <div className="space-y-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-semibold">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <div className="flex flex-col">
                    <span>Shipping</span>
                    {selectedAddress && estimatedDelivery && (
                      <span className="text-xs text-gray-500">
                        {estimatedDelivery}
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-medium ${
                      shippingCost === 0 ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {shippingCost === 0
                      ? "FREE"
                      : `₹${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                {gstAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span className="text-sm">
                      GST (18%)
                      <span className="text-xs ml-1 text-gray-400">incl.</span>
                    </span>
                    <span className="font-medium text-sm">
                      ₹{gstAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="py-4 border-b border-gray-200">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 text-right">
                  Including GST of ₹{gstAmount.toFixed(2)}
                </p>
                {discount > 0 && (
                  <p className="text-sm text-green-600 text-right mt-1">
                    You saved ₹{discount.toLocaleString()}
                  </p>
                )}
                {subtotal >= 1000 && shippingCost === 0 && (
                  <p className="text-sm text-green-600 text-right mt-1 flex items-center justify-end gap-1">
                    <span>🎉</span>
                    Free shipping applied!
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || isProcessing || !user}
                className="w-full mt-6 bg-black text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                {isProcessing
                  ? "Processing..."
                  : !user
                    ? "Login to Place Order"
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
