"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowLeft,
  ArrowRight,
  Lock,
} from "lucide-react";

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Kanchipuram Silk",
      description: "Royal Blue • Free Size",
      price: 350.0,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80",
    },
    {
      id: 2,
      name: "Banarasi Georgette",
      description: "Crimson Red • Free Size",
      price: 210.0,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1583391733981-5096a2c669?w=400&q=80",
    },
    {
      id: 3,
      name: "Mysore Silk",
      description: "Emerald Green • Free Size",
      price: 360.0,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&q=80",
    },
  ]);

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(false);

  const updateQuantity = (id:number, change:any) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id:number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const applyPromo = () => {
    if (promoCode.trim()) {
      setAppliedPromo(true);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 0;
  const vat = subtotal * 0.08;
  const total = subtotal + shipping + vat;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Mobile Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="lg:hidden sticky top-0 z-50 bg-white shadow-sm px-4 py-4 flex items-center justify-between"
      >
        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">My Cart</h1>
        <button className="text-sm text-amber-600 font-medium">Help</button>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-12">
        {/* Desktop Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="hidden lg:block mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            My Cart{" "}
            <span className="text-2xl text-gray-500 font-normal">
              ({cartItems.length} Items)
            </span>
          </h1>
        </motion.div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 mb-6 lg:mb-0">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative flex-shrink-0"
                    >
                      <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-base lg:text-lg mb-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-700">
                            {item.description}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <p className="text-xl lg:text-2xl font-bold text-gray-900">
                          ₹{item.price.toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 lg:gap-3 bg-gray-100 rounded-full px-2 py-1">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </motion.button>

                          <span className="w-8 text-center font-semibold text-gray-900">
                            {item.quantity}
                          </span>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center text-white bg-black rounded-full hover:bg-gray-900 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              {/* Promo Code - Desktop */}
              <div className="hidden lg:block mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Promo Code
                </h3>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={applyPromo}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition"
                  >
                    Apply
                  </motion.button>
                </div>
                {appliedPromo && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-600 text-sm mt-2 flex items-center gap-1"
                  >
                    ✓ Promo code applied
                  </motion.p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>VAT (8%)</span>
                  <span className="font-semibold">₹{vat.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{total.toFixed(2)}
                    </span>
                    <p className="text-sm text-gray-500">incl. VAT</p>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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

        {/* Promo Code - Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:hidden bg-white rounded-2xl p-4 shadow-sm mb-4"
        >
          <h3 className="font-semibold text-gray-900 mb-3">Promo Code</h3>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter coupon code"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={applyPromo}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium"
            >
              Apply
            </motion.button>
          </div>
          {appliedPromo && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-600 text-sm mt-2"
            >
              ✓ Promo code applied
            </motion.p>
          )}
        </motion.div>

        {/* Mobile Summary & Checkout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:hidden bg-white rounded-t-3xl shadow-lg fixed bottom-0 left-0 right-0 p-4 pb-6 z-40"
        >
          <div className="flex justify-between items-baseline mb-4">
            <span className="text-sm text-gray-600">TOTAL</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">
                ₹{total.toFixed(2)}
              </span>
              <p className="text-xs text-gray-500">incl. VAT</p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
          >
            Proceed to Checkout
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Secure Checkout
          </p>
        </motion.div>

        {/* Spacer for mobile fixed footer */}
        <div className="h-32 lg:hidden" />
      </div>
    </div>
  );
};

export default ShoppingCart;
