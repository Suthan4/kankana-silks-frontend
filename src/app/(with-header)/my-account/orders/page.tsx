// "use client";

// import { useState } from "react";
// import {
//   Search,
//   Package,
//   Truck,
//   CheckCircle2,
//   ArrowRight,
//   Loader2,
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useOrders } from "@/hooks/useOrders";

// export default function OrdersPage() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [page, setPage] = useState(1);

//   const tabs = [
//     { id: "all", label: "All", icon: Package },
//     { id: "processing", label: "Processing", icon: Package },
//     { id: "shipped", label: "Shipped", icon: Truck },
//     { id: "delivered", label: "Delivered", icon: CheckCircle2 },
//   ];

//   // Fetch orders with filters
//   const { data, isLoading, error } = useOrders({
//     page,
//     limit: 10,
//     status: activeTab === "all" ? undefined : activeTab,
//     sortBy: "createdAt",
//     sortOrder: "desc",
//   });

//   const orders = data?.data?.orders || [];
//   const pagination = data?.data?.pagination;

//   // Filter by search query (client-side)
//   const filteredOrders = orders.filter(
//     (order) =>
//       order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       order.items.some((item) =>
//         item.productName.toLowerCase().includes(searchQuery.toLowerCase())
//       )
//   );

//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "delivered":
//         return "bg-green-100 text-green-700";
//       case "shipped":
//         return "bg-blue-100 text-blue-700";
//       case "processing":
//         return "bg-orange-100 text-orange-700";
//       case "pending":
//         return "bg-yellow-100 text-yellow-700";
//       case "cancelled":
//         return "bg-red-100 text-red-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   return (
//     <div className="min-h-screen">
//       {/* Header */}
//       <div className="bg-white border-b p-4 lg:p-6 sticky top-0 z-10 shadow-sm">
//         <div className="max-w-4xl mx-auto">
//           <div className="flex items-center justify-between mb-4 lg:mb-6">
//             <div>
//               <h1 className="text-2xl lg:text-3xl font-bold">My Orders</h1>
//               <p className="text-sm text-gray-500 mt-1">
//                 Track and manage your orders
//               </p>
//             </div>
//           </div>

//           {/* Search Bar */}
//           <div className="relative mb-4">
//             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type="text"
//               placeholder="Search by order ID or product name..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 lg:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm lg:text-base"
//             />
//           </div>

//           {/* Tabs */}
//           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
//             {tabs.map((tab) => {
//               const Icon = tab.icon;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => {
//                     setActiveTab(tab.id);
//                     setPage(1);
//                   }}
//                   className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
//                     activeTab === tab.id
//                       ? "bg-black text-white shadow-lg scale-105"
//                       : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                   }`}
//                 >
//                   <Icon className="w-4 h-4" />
//                   {tab.label}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* Orders List */}
//       <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
//         {isLoading ? (
//           <div className="flex items-center justify-center py-16">
//             <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
//           </div>
//         ) : error ? (
//           <div className="text-center py-16">
//             <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Package className="w-10 h-10 text-red-400" />
//             </div>
//             <p className="text-red-500 text-lg font-medium">
//               Failed to load orders
//             </p>
//             <p className="text-gray-400 text-sm mt-2">Please try again later</p>
//           </div>
//         ) : filteredOrders.length === 0 ? (
//           <div className="text-center py-16">
//             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Package className="w-10 h-10 text-gray-300" />
//             </div>
//             <p className="text-gray-500 text-lg font-medium">No orders found</p>
//             <p className="text-gray-400 text-sm mt-2">
//               {searchQuery
//                 ? "Try adjusting your search"
//                 : "Start shopping to see your orders here"}
//             </p>
//           </div>
//         ) : (
//           <>
//             {filteredOrders.map((order) => (
//               <div
//                 key={order.id}
//                 className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
//                 onClick={() => router.push(`/my-account/orders/${order.id}`)}
//               >
//                 <div className="p-5 lg:p-6">
//                   {/* Header */}
//                   <div className="flex items-start justify-between mb-4">
//                     <div>
//                       <div className="font-bold text-base lg:text-lg mb-1">
//                         Order #{order.orderNumber}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         Placed on{" "}
//                         {new Date(order.createdAt).toLocaleDateString("en-IN", {
//                           year: "numeric",
//                           month: "short",
//                           day: "numeric",
//                         })}
//                       </div>
//                     </div>
//                     <span
//                       className={`px-4 py-2 rounded-xl text-xs font-bold ${getStatusColor(
//                         order.status
//                       )}`}
//                     >
//                       {order.status.charAt(0).toUpperCase() +
//                         order.status.slice(1)}
//                     </span>
//                   </div>

//                   {/* Product Info with Image */}
//                   <div className="flex gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
//                     {order.items[0]?.image && (
//                       <img
//                         src={order.items[0].image}
//                         alt={order.items[0].productName}
//                         className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover ring-2 ring-gray-200"
//                       />
//                     )}
//                     <div className="flex-1">
//                       <div className="font-semibold text-sm lg:text-base mb-2">
//                         {order.items[0]?.productName}
//                         {order.items.length > 1 &&
//                           ` +${order.items.length - 1} more`}
//                       </div>
//                       <div className="text-xs text-gray-500 mb-1">
//                         {order.items.length} item(s)
//                       </div>
//                       {order.shipment?.estimatedDelivery && (
//                         <div className="text-xs text-gray-600 mt-2">
//                           <Truck className="w-3 h-3 inline mr-1" />
//                           Est. Delivery:{" "}
//                           {new Date(
//                             order.shipment.estimatedDelivery
//                           ).toLocaleDateString()}
//                         </div>
//                       )}
//                       {order.shipment?.deliveredAt && (
//                         <div className="text-xs text-green-600 mt-2">
//                           <CheckCircle2 className="w-3 h-3 inline mr-1" />
//                           Delivered on{" "}
//                           {new Date(
//                             order.shipment.deliveredAt
//                           ).toLocaleDateString()}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Footer */}
//                   <div className="flex items-center justify-between pt-4 border-t-2">
//                     <div>
//                       <div className="text-xs text-gray-500 mb-1">
//                         Total Amount
//                       </div>
//                       <div className="font-bold text-xl lg:text-2xl">
//                         ₹{order.total.toFixed(2)}
//                       </div>
//                     </div>
//                     <div className="flex gap-2">
//                       {order.shipment?.trackingNumber && (
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             router.push(
//                               `/my-account/order-tracking/${order.id}`
//                             );
//                           }}
//                           className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2"
//                         >
//                           Track Order
//                           <ArrowRight className="w-4 h-4" />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}

//             {/* Pagination */}
//             {pagination && pagination.totalPages > 1 && (
//               <div className="flex items-center justify-center gap-2 mt-8">
//                 <button
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   disabled={page === 1}
//                   className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//                 >
//                   Previous
//                 </button>
//                 <span className="px-4 py-2 text-sm text-gray-600">
//                   Page {page} of {pagination.totalPages}
//                 </span>
//                 <button
//                   onClick={() =>
//                     setPage((p) => Math.min(pagination.totalPages, p + 1))
//                   }
//                   disabled={page === pagination.totalPages}
//                   className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { orderApi } from "@/lib/api/order.api";
import { motion } from "framer-motion";

export default function OrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const tabs = [
    { id: "all", label: "All", icon: Package },
    { id: "PENDING", label: "Pending", icon: Package },
    { id: "PROCESSING", label: "Processing", icon: Package },
    { id: "SHIPPED", label: "Shipped", icon: Truck },
    { id: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
    { id: "CANCELLED", label: "Cancelled", icon: Package },
  ];

  // Fetch orders with filters
  const { data, isLoading, error } = useOrders({
    page,
    limit: 10,
    status: activeTab === "all" ? undefined : (activeTab as any),
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination;

  // Filter by search query (client-side)
  const filteredOrders = orders.filter(
    (order: any) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item: any) =>
        item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

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
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-red-400" />
            </div>
            <p className="text-red-500 text-lg font-medium">
              Failed to load orders
            </p>
            <p className="text-gray-400 text-sm mt-2">Please try again later</p>
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
            {filteredOrders.map((order: any) => {
              const firstItem = order.items?.[0];
              const productName = firstItem?.product?.name ?? "Product";
              const productImage =
                firstItem?.product?.media?.[0]?.thumbnailUrl ||
                firstItem?.product?.media?.[0]?.url ||
                "/images/placeholder.png";
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => router.push(`/my-account/orders/${order.id}`)}
                >
                  <div className="p-5 lg:p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="font-bold text-base lg:text-lg mb-1">
                          Order #{order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-xl text-xs font-bold ${orderApi.getStatusColor(
                          order.status,
                        )}`}
                      >
                        {orderApi.formatStatus(order.status)}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="flex gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover ring-2 ring-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = "/images/placeholder.png";
                        }}
                      />

                      <div className="flex-1">
                        <div className="font-semibold text-sm lg:text-base mb-1">
                          {productName}
                          {order.items.length > 1
                            ? ` +${order.items.length - 1} more`
                            : ""}
                        </div>

                        {/* ✅ Variant Chips */}
                        {firstItem?.variant?.attributes &&
                          Object.keys(firstItem.variant.attributes).length >
                            0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(firstItem.variant.attributes).map(
                                ([key, value]) => (
                                  <span
                                    key={key}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium
                       bg-white border border-gray-200 text-gray-700 shadow-sm"
                                  >
                                    <span className="text-gray-500">
                                      {key}:
                                    </span>
                                    <span className="text-gray-900 font-semibold">
                                      {String(value)}
                                    </span>
                                  </span>
                                ),
                              )}
                            </div>
                          )}

                        <div className="text-xs text-gray-500 mt-2">
                          {order.items.length} item(s)
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Total Amount
                        </div>
                        <div className="font-bold text-xl lg:text-2xl">
                          ₹{Number(order.total).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {order.shipment?.trackingNumber && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/my-account/order-tracking/${order.id}`,
                              );
                            }}
                            className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2"
                          >
                            Track Order
                            <ArrowRight className="w-4 h-4" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/my-account/orders/${order.id}`);
                          }}
                          className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

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
