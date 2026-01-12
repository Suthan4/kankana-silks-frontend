"use client";

import { useState } from "react";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  ArrowRight,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "all", label: "All", icon: Package },
    { id: "processing", label: "Processing", icon: Package },
    { id: "shipped", label: "Shipped", icon: Truck },
    { id: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const orders = [
    {
      id: "ORD-2839",
      date: "Oct 24, 2023",
      total: 4558.0,
      items: 2,
      status: "processing",
      product: "Banarasi Silk Saree & Scarf",
      image:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200",
      estimatedDelivery: "Oct 30, 2023",
    },
    {
      id: "ORD-2710",
      date: "Sep 12, 2023",
      total: 4200.88,
      items: 1,
      status: "delivered",
      product: "Kanchipuram Bridal Saree",
      image:
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200",
      deliveredOn: "Sep 18, 2023",
    },
    {
      id: "ORD-2655",
      date: "Aug 05, 2023",
      total: 6890.0,
      items: 3,
      status: "shipped",
      product: "Mysore Silk Saree Collection",
      image:
        "https://images.unsplash.com/photo-1610030469750-9f629fe04c6a?w=200",
      estimatedDelivery: "Aug 12, 2023",
    },
  ];

  const filteredOrders =
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 lg:p-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">My Orders</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track and manage your orders
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order ID or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 lg:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm lg:text-base"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-black text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
            onClick={() => router.push(`/my-account/orders/${order.id}`)}
          >
            <div className="p-5 lg:p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-bold text-base lg:text-lg mb-1">
                    Order #{order.id}
                  </div>
                  <div className="text-xs text-gray-500">
                    Placed on {order.date}
                  </div>
                </div>
                <span
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "shipped"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Product Info with Image */}
              <div className="flex gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                <img
                  src={order.image}
                  alt={order.product}
                  className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover ring-2 ring-gray-200"
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm lg:text-base mb-2">
                    {order.product}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {order.items} item(s)
                  </div>
                  {order.estimatedDelivery && (
                    <div className="text-xs text-gray-600 mt-2">
                      <Truck className="w-3 h-3 inline mr-1" />
                      Est. Delivery: {order.estimatedDelivery}
                    </div>
                  )}
                  {order.deliveredOn && (
                    <div className="text-xs text-green-600 mt-2">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      Delivered on {order.deliveredOn}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t-2">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                  <div className="font-bold text-xl lg:text-2xl">
                    ₹{order.total.toFixed(2)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/my-account/order-tracking/${order.id}`);
                    }}
                    className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2"
                  >
                    Track Order
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No orders found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
