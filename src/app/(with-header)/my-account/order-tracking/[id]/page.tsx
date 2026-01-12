"use client";

import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrderTrackingPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const timeline = [
    { status: "Order Placed", date: "Oct 24, 10:30 AM", completed: true },
    { status: "Payment Confirmed", date: "Oct 24, 10:31 AM", completed: true },
    { status: "Processing", date: "Oct 25, 09:00 AM", completed: true },
    {
      status: "Shipped",
      date: "Oct 26, 02:15 PM",
      completed: true,
      active: true,
    },
    { status: "Out for Delivery", date: "Expected Oct 28", completed: false },
    { status: "Delivered", date: "Expected Oct 28", completed: false },
  ];

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
            <div>
              <h1 className="text-lg lg:text-xl font-semibold">Track Order</h1>
              <p className="text-sm text-gray-500">Order #ORD-2839</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
        {/* Estimated Delivery */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm opacity-90 mb-1">ESTIMATED DELIVERY</p>
              <h2 className="text-2xl font-bold">Arriving Today</h2>
              <p className="text-lg mt-1">by 6:00 PM</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Truck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Delivery Partner */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
              <div>
                <p className="text-xs text-gray-500 mb-1">DELIVERY PARTNER</p>
                <p className="font-semibold">Ranjan Kumar</p>
              </div>
            </div>
            <button className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition">
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold mb-6">Order Timeline</h3>
          <div className="space-y-6">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="relative">
                  <div
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
                  </div>
                  {idx < timeline.length - 1 && (
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
                      item.active ? "text-black" : "text-gray-700"
                    }`}
                  >
                    {item.status}
                  </p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Delivery Address
          </h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium">Aisha Kapoor</p>
            <p className="text-gray-600">123 MG Road, Indiranagar</p>
            <p className="text-gray-600">Bangalore, Karnataka 560038</p>
            <p className="text-gray-600">+91 98765 43210</p>
          </div>
        </div>
      </div>
    </div>
  );
}
