"use client";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAuthModal } from "@/store/useAuthModalStore";
import { toast } from "@/store/useToastStore";
import AddressModal from "@/components/addressModal";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: "SHIPPING" | "BILLING" | "BOTH";
  isDefault: boolean;
}

type PaymentMethod = "COD" | "CARD" | "UPI" | "WALLET";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, openModal } = useAuthModal();
  const {
    items,
    getSubtotal,
    getDiscount,
    getTotal,
    appliedCoupon,
    clearCart,
  } = useCartStore();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = 0; // Free shipping
  const total = getTotal();

  // Check if user is logged in on mount
  useEffect(() => {
    if (!user) {
      toast.error("Please login to proceed with checkout");
      openModal("login");
      // Optionally redirect after showing modal
      setTimeout(() => {
        router.push("/cart");
      }, 1000);
    }
  }, [user, openModal, router]);

  // Load saved addresses (in real app, this would be an API call)
  useEffect(() => {
    if (user) {
      // TODO: Fetch user addresses from API
      // For now using dummy data
      const dummyAddresses: Address[] = [];
      setSavedAddresses(dummyAddresses);
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    setSavedAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
    if (selectedAddress?.id === addressId) {
      setSelectedAddress(null);
    }
    toast.success("Address deleted");
  };

  const handleSaveAddress = (address: Address) => {
    if (editingAddress) {
      // Update existing address
      setSavedAddresses((prev) =>
        prev.map((addr) => (addr.id === editingAddress.id ? address : addr))
      );
      if (selectedAddress?.id === editingAddress.id) {
        setSelectedAddress(address);
      }
    } else {
      // Add new address
      setSavedAddresses((prev) => [...prev, address]);
      // Auto-select if it's the first address or marked as default
      if (savedAddresses.length === 0 || address.isDefault) {
        setSelectedAddress(address);
      }
    }
    setIsAddressModalOpen(false);
    setEditingAddress(null);
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

      // TODO: Create order via API
      // const orderData = {
      //   items: items.map(item => ({
      //     productId: item.productId,
      //     variantId: item.variantId,
      //     quantity: item.quantity,
      //     price: item.price,
      //   })),
      //   addressId: selectedAddress.id,
      //   paymentMethod,
      //   couponCode: appliedCoupon?.code,
      //   subtotal,
      //   discount,
      //   shipping,
      //   total,
      // };
      // const response = await orderApi.createOrder(orderData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart after successful order
      clearCart();

      toast.success("Order placed successfully!");
      router.push("/orders"); // Redirect to orders page
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render anything if user is not logged in or cart is empty
  if (!user || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
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
          <h1 className="text-4xl font-serif font-bold text-gray-900">
            Checkout
          </h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-900" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Delivery Address
                </h2>
              </div>

              {savedAddresses.length === 0 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddNewAddress}
                  className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-yellow-500 transition-colors"
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
                    {savedAddresses.map((address) => (
                      <motion.div
                        key={address.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => handleAddressSelect(address)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedAddress?.id === address.id
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedAddress?.id === address.id
                                  ? "border-yellow-500 bg-yellow-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedAddress?.id === address.id && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
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
                          <div className="flex gap-2">
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
                    className="w-full py-3 border-2 border-gray-300 rounded-xl hover:border-yellow-500 transition-colors flex items-center justify-center gap-2 text-gray-700 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Add New Address
                  </motion.button>
                </>
              )}
            </motion.div>

            {/* Step 2: Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-gray-900" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  { id: "COD", label: "Cash on Delivery", icon: "💵" },
                  { id: "CARD", label: "Credit/Debit Card", icon: "💳" },
                  { id: "UPI", label: "UPI", icon: "📱" },
                  { id: "WALLET", label: "Wallet", icon: "👛" },
                ].map((method) => (
                  <motion.div
                    key={method.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === method.id
                            ? "border-yellow-500 bg-yellow-500"
                            : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === method.id && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-2xl">{method.icon}</span>
                      <p className="font-semibold text-gray-900">
                        {method.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
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
                        {item.name}
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

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                <p className="text-xs text-gray-500">Including all taxes</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || isProcessing}
                className="w-full mt-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                {isProcessing ? "Processing..." : "Place Order"}
              </motion.button>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Truck className="w-4 h-4" />
                <span>Free delivery on all orders</span>
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
        existingAddress={editingAddress??undefined}
        mode={editingAddress ? "edit" : "create"}
      />
    </div>
  );
}
