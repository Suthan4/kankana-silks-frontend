"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Heart,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Package,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import OrderMobile from "../_mobile/orderMobile";
import OrderDesktop from "../_desktop/orderDesktop";

function MyOrdersPage() {
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState("My Orders");

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "logout", label: "Logout", icon: LogOut },
  ];

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
      orderNumber: "KS-2023-001",
      total: 4558.0,
      items: [
        {
          name: "Banarasi Silk Saree & Scarf",
          quantity: 2,
          image:
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop",
          colors: ["bg-red-700", "bg-yellow-500"],
        },
      ],
      status: "processing",
      statusLabel: "PROCESSING",
      statusColor: "bg-orange-100 text-orange-700",
    },
    {
      id: "ORD-2710",
      date: "Sep 12, 2023",
      orderNumber: "KS-2023-002",
      total: 4200.88,
      items: [
        {
          name: "Kanchipuram Bridal Saree",
          quantity: 1,
          image:
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop",
          colors: ["bg-pink-700"],
        },
      ],
      status: "shipped",
      statusLabel: "DELIVERED ON DEC 18",
      statusColor: "bg-green-100 text-green-700",
      deliveryDate: "Est. Delivery: Oct 30",
    },
    {
      id: "ORD-2655",
      date: "Aug 05, 2023",
      orderNumber: "KS-2023-003",
      total: 6890.0,
      items: [
        {
          name: "Mysore Silk Saree Collection",
          quantity: 3,
          image:
            "https://images.unsplash.com/photo-1610030469750-9f629fe04c6a?w=200&h=200&fit=crop",
          colors: ["bg-blue-600", "bg-purple-600"],
        },
      ],
      status: "delivered",
      statusLabel: "SHIPPED",
      statusColor: "bg-blue-100 text-blue-700",
      deliveryDate: "Delivered on Aug 15",
    },
    {
      id: "ORD-2542",
      date: "Jul 23, 2023",
      orderNumber: "KS-2023-004",
      total: 3500.0,
      items: [
        {
          name: "Traditional Silk Saree",
          quantity: 1,
          image:
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop",
          colors: ["bg-green-700"],
        },
      ],
      status: "delivered",
      statusLabel: "DELIVERED",
      statusColor: "bg-green-100 text-green-700",
      deliveryDate: "Delivered on Aug 9",
    },
  ];

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((order) => order.status === activeTab);

  return isMobile ? (
    <OrderMobile
      tabs={tabs}
      setActiveTab={setActiveTab}
      activeTab={activeTab}
      filteredOrders={filteredOrders}
    />
  ) : (
    <OrderDesktop filteredOrders={filteredOrders} />
  );
}

export default MyOrdersPage;
