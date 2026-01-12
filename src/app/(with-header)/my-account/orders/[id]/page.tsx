"use client";

import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Download,
  Phone,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const order = {
    id: params.id || "ORD-2839",
    orderNumber: "KS-2023-001",
    date: "Oct 24, 2023",
    status: "processing",
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 lg:p-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg lg:text-xl font-semibold">
                Order Details
              </h1>
              <p className="text-sm text-gray-500">{order.orderNumber}</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
        {/* Status Card */}
        <div className="bg-gradient-to-br from-black to-gray-800 text-white rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-80 mb-1">Order Status</p>
              <h2 className="text-2xl font-bold">Processing</h2>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm opacity-90">Placed on {order.date}</p>
          <div className="mt-4 pt-4 border-t border-white/20">
            <button className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition">
              Track Package
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">{item.variant}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ₹{item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{order.shipping.name}</p>
              <p className="text-gray-600">{order.shipping.address}</p>
              <p className="text-gray-600">{order.shipping.city}</p>
              <div className="pt-3 border-t space-y-1">
                <p className="text-gray-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {order.shipping.phone}
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {order.shipping.email}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹4,560.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">₹365.00</span>
              </div>
              <div className="pt-3 border-t flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-xl">
                  ₹{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
