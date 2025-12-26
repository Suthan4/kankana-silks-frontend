"use client"
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  MapPin,
  Phone,
  CreditCard,
  Heart,
  Video,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Home,
  ShoppingBag,
  Calendar,
  UserCircle,
  ChevronLeft,
  Search,
  Bell,
  ShoppingCart,
  Eye,
} from "lucide-react";

const OrderTrackingApp = () => {
  const [currentPage, setCurrentPage] = useState("tracking");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const orderData = {
    status: "Arriving Today",
    time: "by 6:00 PM",
    orderId: "ID-902-882455",
    timeline: [
      { status: "Order Placed", date: "Oct 25, 10:30 AM", completed: true },
      {
        status: "Shipped from Varanasi",
        date: "Oct 28, 09:15 AM",
        completed: true,
      },
      {
        status: "Out for Delivery",
        date: "Today",
        completed: false,
        active: true,
      },
      { status: "Delivered", date: "Expected by 6 PM", completed: false },
    ],
    delivery: {
      type: "Home",
      name: "Aaronya Iyer",
      address: "123/58 Real, Indiranagar",
      city: "Bangalore, Karnataka 560038",
      phone: "+91 98765 43210",
    },
    deliveryPartner: {
      name: "Ranjan Kumar",
    },
    item: {
      name: "Royal Gold Silk Saree",
      variant: "Qty: 1 | Blue/Gold",
      price: "₹24,500",
      image: "🟡",
    },
  };

  const ordersData = [
    {
      id: "#WD-90211-38225",
      date: "Oct 25, 2023",
      deliveryDate: "Oct 30, 2023",
      items: 3,
      total: "₹74,500",
      status: "PROCESSING",
      products: [{ name: "Banarasi Silk Saree & Scarf", color: "🔴🟡" }],
    },
    {
      id: "#WD-48008-54243",
      date: "Oct 22, 2023",
      deliveryDate: "Oct 28, 2023",
      items: 1,
      total: "₹34,500",
      status: "DELIVERED",
      products: [{ name: "Kanchipuram Bridal Saree", color: "🔴" }],
    },
    {
      id: "#WD-34562-78291",
      date: "Oct 18, 2023",
      deliveryDate: "Oct 24, 2023",
      items: 2,
      total: "₹54,000",
      status: "SHIPPED",
      products: [{ name: "Mysore Silk Saree Collection", color: "🔵🟣" }],
    },
  ];



  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i:number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  // Order Tracking Page
  const OrderTrackingPage = () => (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4 lg:space-y-6"
    >
      {/* Back Button - Mobile */}
      <button
        onClick={() => setCurrentPage("orders")}
        className="lg:hidden flex items-center text-gray-600 mb-4"
      >
        <ChevronLeft size={20} />
        <span className="ml-1">Back</span>
      </button>

      {/* Page Title - Desktop */}
      <div className="hidden lg:block">
        <h1 className="text-2xl font-serif mb-2">Track Your Order</h1>
        <p className="text-sm text-gray-500">Order {orderData.orderId}</p>
      </div>

      {/* Estimated Delivery Card */}
      <div className="bg-amber-50 rounded-2xl p-4 lg:p-6 relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <Package className="text-amber-400" size={24} />
        </div>
        <div className="text-xs text-amber-700 font-medium mb-1">
          ESTIMATED DELIVERY
        </div>
        <h2 className="text-xl lg:text-2xl font-serif mb-1">
          {orderData.status}
        </h2>
        <p className="text-gray-600">{orderData.time}</p>
        <p className="text-xs text-gray-500 mt-2 lg:hidden">
          Order {orderData.orderId}
        </p>
      </div>

      {/* Map with Delivery Partner */}
      <div className="bg-teal-400 rounded-2xl h-40 lg:h-48 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <path
              d="M 50 150 Q 100 50, 150 100 T 250 80 T 350 120"
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeDasharray="5,5"
            />
          </svg>
        </div>
        <div className="absolute bottom-3 left-3 lg:bottom-4 lg:left-4 bg-white rounded-xl p-2 lg:p-3 shadow-lg flex items-center space-x-2 lg:space-x-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={16} className="lg:w-5 lg:h-5" />
          </div>
          <div>
            <div className="text-xs font-medium">DELIVERY PARTNER</div>
            <div className="text-sm font-semibold">
              {orderData.deliveryPartner.name}
            </div>
          </div>
          <button className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Phone size={14} className="text-white" />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-4 lg:p-6">
        <h3 className="font-semibold mb-4 lg:mb-6">Timeline</h3>
        <div className="space-y-4 lg:space-y-6">
          {orderData.timeline.map((item, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex items-start space-x-3 lg:space-x-4"
            >
              <div
                className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.completed
                    ? "bg-amber-400"
                    : item.active
                    ? "bg-amber-200"
                    : "bg-gray-200"
                }`}
              >
                {item.completed && (
                  <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-white rounded-full" />
                )}
                {item.active && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-amber-500 rounded-full"
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="font-medium text-sm lg:text-base">
                  {item.status}
                </div>
                <div className="text-xs lg:text-sm text-gray-500">
                  {item.date}
                </div>
                {item.active && (
                  <div className="text-xs text-gray-400 mt-1">
                    Your order is on the way to your delivery address
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Delivery Details */}
      <div className="bg-white rounded-2xl p-4 lg:p-6">
        <h3 className="font-semibold mb-4">Delivery Details</h3>
        <div className="flex items-start space-x-3 mb-4 lg:mb-6">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Home size={16} className="text-amber-600" />
          </div>
          <div>
            <div className="font-medium text-sm lg:text-base">
              {orderData.delivery.type}
            </div>
            <div className="text-xs lg:text-sm text-gray-600">
              {orderData.delivery.name}
            </div>
            <div className="text-xs lg:text-sm text-gray-500">
              {orderData.delivery.address}
            </div>
            <div className="text-xs lg:text-sm text-gray-500">
              {orderData.delivery.city}
            </div>
            <div className="text-xs lg:text-sm text-gray-500">
              {orderData.delivery.phone}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-gray-50 rounded-xl">
          <div className="text-3xl lg:text-4xl">{orderData.item.image}</div>
          <div className="flex-1">
            <div className="font-medium text-sm lg:text-base">
              {orderData.item.name}
            </div>
            <div className="text-xs lg:text-sm text-gray-500">
              {orderData.item.variant}
            </div>
            <div className="font-semibold text-amber-600 mt-1">
              {orderData.item.price}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 sticky bottom-0 bg-gray-50 py-4 lg:relative lg:bg-transparent lg:py-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition text-sm lg:text-base"
        >
          Support
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="py-3 bg-amber-400 rounded-xl font-medium hover:bg-amber-500 transition text-sm lg:text-base"
        >
          Invoice
        </motion.button>
      </div>
    </motion.div>
  );

  // My Orders Page
  const MyOrdersPage = () => (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4 lg:space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-serif">My Orders</h1>
          <p className="text-sm text-gray-500">Track and manage your orders</p>
        </div>
        <div className="hidden lg:flex space-x-2">
          <button className="px-4 py-2 bg-amber-400 text-sm font-medium rounded-lg">
            All Orders
          </button>
          <button className="px-4 py-2 bg-gray-100 text-sm font-medium rounded-lg hover:bg-gray-200">
            Processing
          </button>
          <button className="px-4 py-2 bg-gray-100 text-sm font-medium rounded-lg hover:bg-gray-200">
            Shipped
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search for orders..."
          className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
        />
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {ordersData.map((order, index) => (
          <motion.div
            key={order.id}
            custom={index}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => setCurrentPage("tracking")}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Order Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-sm lg:text-base mb-1">
                      {order.id}
                    </div>
                    <div className="text-xs text-gray-500">
                      Order Date: {order.date}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "PROCESSING"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "DELIVERED"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Product Preview */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl mb-3">
                  <div className="text-2xl">{order.products[0].color}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {order.products[0].name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.items} item(s)
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-500">Delivery by: </span>
                    <span className="font-medium">{order.deliveryDate}</span>
                  </div>
                  <div className="font-semibold text-amber-600">
                    {order.total}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col gap-2 lg:gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 lg:w-32 px-4 py-2 bg-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500 transition"
                >
                  Track Order
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 lg:w-32 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  View Details
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
  );

  // Profile Overview Page
  // const ProfilePage = () => (

  // );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 lg:h-16">
            <div className="flex items-center">
              <h1 className="text-base lg:text-xl font-serif tracking-wider">
                KANKANA SILKS
              </h1>
              <span className="ml-2 text-xs text-gray-400 hidden sm:inline">
                EST. 1985
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              <a href="#" className="text-sm hover:text-amber-600 transition">
                Home
              </a>
              <a href="#" className="text-sm hover:text-amber-600 transition">
                Shop
              </a>
              <a href="#" className="text-sm hover:text-amber-600 transition">
                Occasions
              </a>
              <button
                onClick={() => setCurrentPage("profile")}
                className="text-sm text-amber-600 font-medium"
              >
                Profile
              </button>
            </nav>

            {/* Desktop Icons */}
            <div className="hidden lg:flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Search size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Heart size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ShoppingCart size={20} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t bg-white overflow-hidden"
            >
              <nav className="px-4 py-4 space-y-2">
                <a href="#" className="block py-2 text-sm hover:text-amber-600">
                  Home
                </a>
                <a href="#" className="block py-2 text-sm hover:text-amber-600">
                  Shop
                </a>
                <a href="#" className="block py-2 text-sm hover:text-amber-600">
                  Occasions
                </a>
                <button
                  onClick={() => {
                    setCurrentPage("profile");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-sm text-amber-600 font-medium"
                >
                  Profile
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <AnimatePresence mode="wait">
          {currentPage === "tracking" && (
            <div key="tracking" className="lg:grid lg:grid-cols-2 lg:gap-8">
              <OrderTrackingPage />
              <div className="hidden lg:block">
                {/* <ProfilePage /> */}
              </div>
            </div>
          )}
          {currentPage === "orders" && (
            <div key="orders" className="lg:grid lg:grid-cols-2 lg:gap-8">
              <MyOrdersPage />
              <div className="hidden lg:block">
                {/* <ProfilePage /> */}
              </div>
            </div>
          )}
          {currentPage === "profile" && (
            <div key="profile" className="max-w-2xl mx-auto lg:max-w-7xl">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                <div className="lg:order-2">
                  {/* <ProfilePage /> */}
                </div>
                <div className="hidden lg:block lg:order-1">
                  <MyOrdersPage />
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => setCurrentPage("orders")}
            className={`flex flex-col items-center justify-center ${
              currentPage === "orders" ? "text-amber-600" : "text-gray-400"
            }`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={() => setCurrentPage("orders")}
            className={`flex flex-col items-center justify-center ${
              currentPage === "orders" ? "text-amber-600" : "text-gray-400"
            }`}
          >
            <ShoppingBag size={20} />
            <span className="text-xs mt-1">Orders</span>
          </button>
          <button className="flex flex-col items-center justify-center text-gray-400">
            <Heart size={20} />
            <span className="text-xs mt-1">Wishlist</span>
          </button>
          <button
            onClick={() => setCurrentPage("profile")}
            className={`flex flex-col items-center justify-center ${
              currentPage === "profile" ? "text-amber-600" : "text-gray-400"
            }`}
          >
            <UserCircle size={20} />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-8 lg:mt-16 mb-16 lg:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div>
              <h3 className="font-serif text-base lg:text-lg mb-3 lg:mb-4">
                KANKANA SILKS
              </h3>
              <p className="text-xs lg:text-sm text-gray-600">
                Crafting the timeless beauty of pure Kanchipuram silks,
                hand-loomed by master artisans.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm lg:text-base mb-3 lg:mb-4">
                Shop
              </h4>
              <ul className="space-y-2 text-xs lg:text-sm text-gray-600">
                <li>New Arrivals</li>
                <li>Best Sellers</li>
                <li>Wedding Collection</li>
                <li>Accessories</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm lg:text-base mb-3 lg:mb-4">
                Support
              </h4>
              <ul className="space-y-2 text-xs lg:text-sm text-gray-600">
                <li>Order Tracking</li>
                <li>Terms & Conditions</li>
                <li>Privacy Policy</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm lg:text-base mb-3 lg:mb-4">
                Connect
              </h4>
              <div className="flex space-x-3 lg:space-x-4">
                <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t text-center text-xs lg:text-sm text-gray-500">
            © 2023 Kankana Silks. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OrderTrackingApp;
