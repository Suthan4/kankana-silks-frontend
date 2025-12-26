"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Download,
  Share2,
  Copy,
  Check,
} from "lucide-react";

interface OrderDetailsProps {
  orderId?: string;
  onBack?: () => void;
}

export default function OrderDetails({ orderId, onBack }: OrderDetailsProps) {
  const [copied, setCopied] = useState(false);

  const order = {
    id: orderId || "ORD-2839",
    orderNumber: "KS-2023-001",
    date: "Oct 24, 2023",
    status: "shipped",
    total: 4558.0,
    items: [
      {
        name: "Royal Crimson Kanjivaram",
        variant: "Pure Zari Weave • Free Size",
        price: 2280.0,
        quantity: 2,
        image:
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300",
      },
    ],
    shipping: {
      name: "Aisha Kapoor",
      address: "123 MG Road, Indiranagar",
      city: "Bangalore, Karnataka 560038",
      phone: "+91 98765 43210",
      email: "aisha.kapoor@example.com",
    },
    timeline: [
      { status: "Order Placed", date: "Oct 24, 10:30 AM", completed: true },
      {
        status: "Payment Confirmed",
        date: "Oct 24, 10:31 AM",
        completed: true,
      },
      { status: "Processing", date: "Oct 25, 09:00 AM", completed: true },
      {
        status: "Shipped",
        date: "Oct 26, 02:15 PM",
        completed: true,
        active: true,
      },
      {
        status: "Out for Delivery",
        date: "Expected Oct 28",
        completed: false,
      },
      { status: "Delivered", date: "Expected Oct 28", completed: false },
    ],
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 md:p-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </motion.div>

        {/* Order Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order Details
              </h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={copyOrderId}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  <span className="font-mono">{order.orderNumber}</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">{order.date}</p>
            </div>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              In Transit
            </span>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
        >
          <h2 className="font-semibold text-gray-900 mb-6">Order Timeline</h2>
          <div className="space-y-6">
            {order.timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="flex gap-4"
              >
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.completed
                        ? "bg-green-100"
                        : item.active
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : item.active ? (
                      <Truck className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Package className="w-5 h-5 text-gray-400" />
                    )}
                  </motion.div>
                  {index < order.timeline.length - 1 && (
                    <div
                      className={`absolute left-5 top-10 w-0.5 h-6 ${
                        item.completed ? "bg-green-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p
                    className={`font-medium ${
                      item.active ? "text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {item.status}
                  </p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Items */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Order Items</h2>
          {order.items.map((item, index) => (
            <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.variant}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Qty: {item.quantity}
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₹{item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Shipping & Payment */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              Shipping Address
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{order.shipping.name}</p>
              <p className="text-gray-600">{order.shipping.address}</p>
              <p className="text-gray-600">{order.shipping.city}</p>
              <p className="text-gray-600 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {order.shipping.phone}
              </p>
              <p className="text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {order.shipping.email}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-600" />
              Payment Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹4,560.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">₹365.00</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl">
                  ₹{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
