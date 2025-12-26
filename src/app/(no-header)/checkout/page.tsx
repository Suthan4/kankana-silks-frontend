"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ShoppingBag,
  MapPin,
  Truck,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
} from "lucide-react";

function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [billingAddress, setBillingAddress] = useState(false);

  const steps = [
    { id: 1, name: "Address", icon: ShoppingBag },
    { id: 2, name: "Payment", icon: CreditCard },
    { id: 3, name: "Review", icon: CheckCircle2 },
  ];

  const cartItems = [
    {
      id: 1,
      name: "Royal Kanjivaram Silk",
      details: "Pure Silk • Free Size",
      size: "L",
      price: 250.0,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop",
      color: "bg-blue-600",
    },
    {
      id: 2,
      name: "Banarasi Georgette",
      details: "Georgette • Free Size",
      size: "L",
      price: 370.0,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1610030469750-9f629fe04c6a?w=200&h=200&fit=crop",
      color: "bg-red-600",
    },
    {
      id: 3,
      name: "Mysore Silk",
      details: "Handloom • Free Size",
      size: "2",
      price: 580.0,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop",
      color: "bg-green-700",
    },
  ];

  const paymentMethods = [
    {
      id: "credit",
      name: "Credit / Debit Card",
      icon: CreditCard,
      logos: ["💳", "💳"],
    },
    {
      id: "upi",
      name: "UPI",
      subtitle: "Google Pay, PhonePe, Paytm",
      icon: Smartphone,
    },
    {
      id: "banking",
      name: "Net Banking",
      subtitle: "All major banks are supported",
      icon: Building2,
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      subtitle: "Pay when your order arrives",
      icon: Truck,
    },
  ];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 15.0;
  const discount = 30.0;
  const total = subtotal + shipping - discount;

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6 md:mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                scale: isActive ? 1.1 : 1,
              }}
              className="flex flex-col items-center"
            >
              <motion.div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center relative ${
                  isActive || isCompleted
                    ? "bg-yellow-400 text-gray-900"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
                {isActive && (
                  <motion.div
                    layoutId="activeStep"
                    className="absolute inset-0 rounded-full border-2 border-yellow-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.div>
              <span className="text-xs mt-2 font-medium hidden md:block">
                {step.name}
              </span>
            </motion.div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 md:w-20 h-0.5 mx-2 ${
                  isCompleted ? "bg-yellow-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }}>
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <h1 className="text-lg md:text-xl font-bold">
              {currentStep === 1
                ? "Checkout"
                : currentStep === 2
                ? "Payment Method"
                : "Review Order"}
            </h1>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <StepIndicator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Contact & Shipping */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Contact Details */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-orange-500">📧</span>
                      <h2 className="font-semibold text-gray-900">
                        Contact Details
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 md:col-span-2"
                        defaultValue="+91 36758 44710"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      We will use this for delivery updates
                    </p>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-orange-500">📍</span>
                      <h2 className="font-semibold text-gray-900">
                        Shipping Address
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="560001"
                          className="w-24 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        <input
                          type="text"
                          placeholder="INDIA"
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-yellow-50 text-yellow-700 font-medium"
                          disabled
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <input
                        type="text"
                        placeholder="House No, Building Name"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <input
                        type="text"
                        placeholder="Road, Area, Colony"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="City"
                          defaultValue="Bengaluru"
                          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          defaultValue="Karnataka"
                          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                      <motion.label
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="w-5 h-5 accent-yellow-400 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Save this address for later
                        </span>
                      </motion.label>
                      <motion.label
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.checked)}
                          className="w-5 h-5 accent-yellow-400 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Use as billing address
                        </span>
                      </motion.label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg p-6 shadow-sm"
                >
                  <p className="text-sm text-gray-600 mb-6">
                    Select how you would like to pay for your order
                  </p>

                  <div className="space-y-3">
                    {paymentMethods.map((method, index) => {
                      const Icon = method.icon;
                      return (
                        <motion.div
                          key={method.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            paymentMethod === method.id
                              ? "border-yellow-400 bg-yellow-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  method.id === "credit"
                                    ? "bg-yellow-100"
                                    : method.id === "upi"
                                    ? "bg-green-100"
                                    : method.id === "banking"
                                    ? "bg-blue-100"
                                    : "bg-orange-100"
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-gray-900">
                                    {method.name}
                                  </h3>
                                  {method.logos && (
                                    <div className="flex gap-1">
                                      {method.logos.map((logo, i) => (
                                        <span key={i} className="text-lg">
                                          {logo}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {method.subtitle && (
                                  <p className="text-xs text-gray-500">
                                    {method.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          {paymentMethod === method.id && (
                            <motion.div
                              layoutId="paymentIndicator"
                              className="absolute inset-0 border-2 border-yellow-400 rounded-lg pointer-events-none"
                              transition={{
                                type: "spring",
                                stiffness: 380,
                                damping: 30,
                              }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {paymentMethod === "credit" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 space-y-3"
                    >
                      <input
                        type="text"
                        placeholder="Card Number"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <input
                        type="text"
                        placeholder="Name on Card"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Review Order */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Order Items - Mobile */}
                  <div className="bg-white rounded-lg p-6 shadow-sm lg:hidden">
                    <h2 className="font-semibold text-gray-900 mb-4">
                      ITEMS IN CART
                    </h2>
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-4 pb-4 mb-4 border-b last:border-b-0 last:pb-0 last:mb-0"
                      >
                        <div
                          className={`w-16 h-16 ${item.color} rounded-lg`}
                        ></div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.details}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Size: {item.size}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-gray-900">
                        SHIPPING ADDRESS
                      </h2>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="text-sm text-yellow-600 font-medium"
                      >
                        EDIT
                      </motion.button>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Amayra Gupta
                        </p>
                        <p className="text-sm text-gray-600">
                          301, Lotus Boulevard, Sector 100,
                          <br />
                          Noida, Uttar Pradesh - 201304
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-gray-900">
                        PAYMENT METHOD
                      </h2>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="text-sm text-yellow-600 font-medium"
                      >
                        CHANGE
                      </motion.button>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-600">Visa ending in 4242</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Expires 12/25</p>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                    <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Free Express Shipping
                      </p>
                      <p className="text-sm text-blue-700">Arrives by Dec 28</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-6 shadow-sm sticky top-24"
            >
              <h2 className="font-semibold text-gray-900 mb-4">
                {currentStep === 3 ? "ORDER SUMMARY" : "Order Summary"}
              </h2>

              {/* Items - Desktop Only */}
              {currentStep !== 3 && (
                <div className="hidden lg:block mb-4 pb-4 border-b">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 mb-3 last:mb-0">
                      <div className={`w-12 h-12 ${item.color} rounded`}></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Size: {item.size}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount (10%)</span>
                  <span className="text-green-600">
                    -₹{discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {currentStep > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="w-full py-3 border-2 border-gray-300 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (currentStep < 3) setCurrentStep(currentStep + 1);
                  }}
                  className="w-full py-3 bg-yellow-400 rounded-full font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                >
                  {currentStep === 3 ? "Place Order" : "Continue to Payment"}
                  <span>→</span>
                </motion.button>
              </div>

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 space-y-2"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-yellow-500">🚚</span>
                    <span className="text-gray-600">Free Express Shipping</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-yellow-500">🔄</span>
                    <span className="text-gray-600">Return Policy</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
