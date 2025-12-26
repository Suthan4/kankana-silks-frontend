import { Search, Star } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react'

interface IProps {
  filteredOrders: any;
}

export default function OrderDesktop({filteredOrders}:IProps) {

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="col-span-3"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Order ID or Product"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 w-64"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400">
              <option>All Orders</option>
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order:any, index:number) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-400 uppercase text-xs mb-1">
                      ORDER PLACED
                    </p>
                    <p className="text-gray-900">{order.date}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-400 uppercase text-xs mb-1">
                      ORDER #
                    </p>
                    <p className="text-gray-900">{order.orderNumber}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-400 uppercase text-xs mb-1">
                      TOTAL
                    </p>
                    <p className="text-gray-900 font-semibold">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-yellow-600 text-sm font-medium hover:text-yellow-700"
                >
                  View Order Details →
                </motion.button>
              </div>

              <div className="flex items-center gap-4">
                {/* Product Images */}
                <div className="flex -space-x-2">
                  {order.items[0].colors.map((color:any, i:number) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 + i * 0.1 }}
                      className={`w-20 h-20 ${color} rounded-lg border-2 border-white`}
                    />
                  ))}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {order.items[0].name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {order.items[0].quantity} Items
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${order.statusColor}`}
                    >
                      {order.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {order.status === "processing" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      Cancel Order
                    </motion.button>
                  )}
                  {order.status === "shipped" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      Write Review
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-yellow-400 rounded-lg text-sm font-semibold hover:bg-yellow-500"
                  >
                    Track Package
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}

        <div className="flex items-center justify-center space-x-2 pt-4">
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
            Previous
          </button>
          <button className="w-8 h-8 bg-amber-400 rounded-lg text-sm font-medium">
            1
          </button>
          <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm">
            2
          </button>
          <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm">
            3
          </button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
            Next
          </button>
        </div>
      </motion.div>
    </>
  );
}
