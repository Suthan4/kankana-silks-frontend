"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Package,
  ArrowLeft,
  Search,
  Filter,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getReturnStatusLabel, ReturnStatus } from "@/lib/api/return.api";
import { useUserReturns } from "@/hooks/useUserReturns";


export default function ReturnsListPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useUserReturns({
    page: 1,
    limit: 20,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const returns = data?.returns || [];
  const pagination = data?.pagination;

  // Filter by search query
  const filteredReturns = returns.filter((returnItem: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      returnItem.returnNumber.toLowerCase().includes(searchLower) ||
      returnItem.order.orderNumber.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: ReturnStatus) => {
    switch (status) {
      case ReturnStatus.PENDING:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case ReturnStatus.APPROVED:
        return "bg-green-100 text-green-700 border-green-200";
      case ReturnStatus.REJECTED:
        return "bg-red-100 text-red-700 border-red-200";
      case ReturnStatus.PICKUP_SCHEDULED:
      case ReturnStatus.PICKED_UP:
      case ReturnStatus.IN_TRANSIT:
        return "bg-blue-100 text-blue-700 border-blue-200";
      case ReturnStatus.RECEIVED:
      case ReturnStatus.INSPECTED:
        return "bg-purple-100 text-purple-700 border-purple-200";
      case ReturnStatus.REFUND_INITIATED:
      case ReturnStatus.REFUND_COMPLETED:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 lg:p-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex-1">
              <h1 className="text-lg lg:text-xl font-semibold">My Returns</h1>
              <p className="text-sm text-gray-500">
                {pagination?.total || 0} returns
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by return or order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white min-w-[180px]"
              >
                <option value="ALL">All Status</option>
                <option value={ReturnStatus.PENDING}>Pending</option>
                <option value={ReturnStatus.APPROVED}>Approved</option>
                <option value={ReturnStatus.REJECTED}>Rejected</option>
                <option value={ReturnStatus.PICKUP_SCHEDULED}>
                  Pickup Scheduled
                </option>
                <option value={ReturnStatus.PICKED_UP}>Picked Up</option>
                <option value={ReturnStatus.IN_TRANSIT}>In Transit</option>
                <option value={ReturnStatus.RECEIVED}>Received</option>
                <option value={ReturnStatus.REFUND_INITIATED}>
                  Refund Initiated
                </option>
                <option value={ReturnStatus.REFUND_COMPLETED}>
                  Refund Completed
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 mb-4"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">
                Error Loading Returns
              </p>
              <p className="text-sm text-red-700 mt-1">
                {error.message || "Failed to load returns"}
              </p>
            </div>
          </motion.div>
        )}

        {filteredReturns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Returns Found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your filters"
                : "You haven't made any return requests yet"}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/my-account/orders")}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              View Orders
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredReturns.map((returnItem: any, index: number) => (
              <motion.div
                key={returnItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() =>
                  router.push(`/my-account/returns/${returnItem.id}`)
                }
                className="bg-white rounded-2xl p-4 lg:p-6 hover:shadow-lg transition cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {returnItem.returnNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Order: {returnItem.order.orderNumber}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(returnItem.status)}`}
                  >
                    {getReturnStatusLabel(returnItem.status)}
                  </span>
                </div>

                {/* Items Summary */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="flex -space-x-2">
                    {returnItem.returnItems.slice(0, 3).map((item: any) => (
                      <div
                        key={item.id}
                        className="w-12 h-12 rounded-lg overflow-hidden ring-2 ring-white"
                      >
                        <img
                          src={
                            item.product.media[0]?.thumbnailUrl ||
                            item.product.media[0]?.url
                          }
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {returnItem.returnItems.length > 3 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 ring-2 ring-white flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          +{returnItem.returnItems.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {returnItem.returnItems.length} item(s) returned
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Refund Amount</p>
                    <p className="font-bold text-lg">
                      ₹{Number(returnItem.refundAmount).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Created</p>
                    <p className="text-sm font-medium">
                      {new Date(returnItem.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
