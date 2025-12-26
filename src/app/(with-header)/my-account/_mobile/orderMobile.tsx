import { ChevronLeft, Truck } from "lucide-react";
import { motion } from "motion/react";
import { Dispatch, SetStateAction } from "react";
interface IProps {
  tabs: any;
  filteredOrders: any;
  setActiveTab: Dispatch<SetStateAction<string>>;
  activeTab: string;
}
export default function OrderMobile({ setActiveTab,activeTab,tabs, filteredOrders }: IProps) {
  return (
    <>
      {/* Mobile Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b sticky top-0 z-40"
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <motion.button whileTap={{ scale: 0.9 }}>
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-lg font-bold">My Orders</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {tabs.map((tab: any) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-yellow-400 text-gray-900"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-yellow-400 rounded-full -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Mobile Orders */}
      <div className="px-4 py-4 space-y-4">
        {filteredOrders.map((order: any, index: number) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-16 h-16 ${order.items[0].colors[0]} rounded-lg flex-shrink-0`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Order #{order.id}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${order.statusColor} whitespace-nowrap`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{order.date}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{order.total.toFixed(2)}{" "}
                    <span className="text-gray-400 font-normal text-xs">
                      ({order.items[0].quantity} items)
                    </span>
                  </p>
                </div>
              </div>

              {order.deliveryDate && (
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                  <Truck className="w-4 h-4" />
                  <span>{order.deliveryDate}</span>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 bg-yellow-400 rounded-lg text-sm font-semibold"
              >
                Track Order
              </motion.button>

              {order.status === "delivered" && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-2 py-2.5 border border-gray-300 rounded-lg text-sm font-medium"
                >
                  View Details
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}

        <p className="text-center text-sm text-gray-500 py-4">
          Showing 4 of 12 Orders
        </p>
      </div>
    </>
  );
}
