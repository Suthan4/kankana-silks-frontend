"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { orderApi } from "@/lib/api/order.api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { OrdersPageSkeleton } from "@/features/orders/components/OrderPageSkeletons";

export default function OrdersPage() {
  const router = useRouter();
  const openOrder = useCallback(
    (orderId: string) => router.push(`/my-account/orders/${orderId}`),
    [router],
  );
  const trackOrder = useCallback(
    (orderId: string) => router.push(`/my-account/order-tracking/${orderId}`),
    [router],
  );
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [downloadingInvoices, setDownloadingInvoices] = useState<Set<string>>(
    new Set(),
  );

  const tabs = [
    { id: "all", label: "All", icon: Package },
    { id: "PENDING", label: "Pending", icon: Package },
    { id: "PROCESSING", label: "Processing", icon: Package },
    { id: "SHIPPED", label: "Shipped", icon: Truck },
    { id: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
    { id: "CANCELLED", label: "Cancelled", icon: Package },
  ];

  // Fetch orders with filters
  const { data, isLoading, error, refetch } = useOrders({
    page,
    limit: 10,
    status: activeTab === "all" ? undefined : (activeTab as any),
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination;

  // Filter by search query (client-side)
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order: any) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.some((item: any) =>
            item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      ),
    [orders, searchQuery],
  );

  const isInvoiceAvailable = (order: any) =>
    ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED"].includes(order.status);

  // ✅ Invoice download handler
  const handleDownloadInvoice = useCallback(async (e: React.MouseEvent, order: any) => {
    e.stopPropagation();

    if (!isInvoiceAvailable(order)) {
      toast.error("Invoice not available yet. Please wait for shipment.");
      return;
    }

    if (downloadingInvoices.has(order.id)) return;

    try {
      setDownloadingInvoices((prev) => new Set(prev).add(order.id));

      const response = await orderApi.downloadInvoice(order.id);

      // Create blob from response
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create download link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully");
    } catch (error: any) {
      console.error("Failed to download invoice:", error);
      toast.error(error.message || "Failed to download invoice");
    } finally {
      setDownloadingInvoices((prev) => {
        const newSet = new Set(prev);
        newSet.delete(order.id);
        return newSet;
      });
    }
  }, [downloadingInvoices]);

  return (
    <div className="min-h-screen bg-gray-50">
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
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}
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
        {isLoading ? (
          <OrdersPageSkeleton />
        ) : error && !data ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-red-400" />
            </div>
            <p className="text-red-500 text-lg font-medium">
              Failed to load orders
            </p>
            <p className="text-gray-400 text-sm mt-2">Your order history is still available. Please retry.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No orders found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchQuery
                ? "Try adjusting your search"
                : "Start shopping to see your orders here"}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/")}
              className="mt-6 px-8 py-3 bg-black text-white rounded-full font-semibold"
            >
              Start Shopping
            </motion.button>
          </div>
        ) : (
          <>
            {filteredOrders.map((order: any) => (
              <OrderCard
                key={order.id}
                order={order}
                isDownloading={downloadingInvoices.has(order.id)}
                onOpenOrder={openOrder}
                onTrackOrder={trackOrder}
                onDownloadInvoice={handleDownloadInvoice}
              />
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  Previous
                </motion.button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {pagination.totalPages}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  Next
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
