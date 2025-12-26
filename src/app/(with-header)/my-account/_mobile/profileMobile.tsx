import {
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  ShoppingBag,
  User,
  Video,
} from "lucide-react";
import { motion, Variants } from "motion/react";
import React from "react";
interface IProps {
  pageVariants: any;
  profileData: any;
}
export default function ProfileMobile({ pageVariants,profileData }: IProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4 lg:space-y-6"
    >
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative inline-block mb-4"
        >
          <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-3xl lg:text-4xl">
            {profileData.avatar}
          </div>
          <div className="absolute bottom-0 right-0 w-5 h-5 lg:w-6 lg:h-6 bg-amber-400 rounded-full border-4 border-white"></div>
        </motion.div>
        <h2 className="text-lg lg:text-xl font-serif mb-1">
          {profileData.name}
        </h2>
        <p className="text-xs lg:text-sm text-gray-500 mb-1">
          {profileData.email}
        </p>
        <p className="text-xs lg:text-sm text-gray-500">{profileData.phone}</p>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4 mt-6">
          <motion.button
            whileHover={{ y: -4 }}
            // onClick={() => setCurrentPage("orders")}
            className="p-3 lg:p-4 bg-gray-50 rounded-xl hover:bg-amber-50 transition relative"
          >
            <ShoppingBag
              size={18}
              className="lg:w-5 lg:h-5 mx-auto mb-2 text-gray-700"
            />
            <div className="text-xs lg:text-sm font-medium">My Orders</div>
            <div className="absolute top-2 right-2 w-5 h-5 bg-amber-400 rounded-full text-xs flex items-center justify-center font-bold">
              3
            </div>
          </motion.button>
          <motion.button
            whileHover={{ y: -4 }}
            className="p-3 lg:p-4 bg-gray-50 rounded-xl hover:bg-amber-50 transition"
          >
            <Video
              size={18}
              className="lg:w-5 lg:h-5 mx-auto mb-2 text-gray-700"
            />
            <div className="text-xs lg:text-sm font-medium">Video Shopping</div>
          </motion.button>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-2xl p-4 lg:p-6">
        <h3 className="font-semibold mb-4 text-xs text-gray-500 uppercase tracking-wider">
          Account Settings
        </h3>
        <div className="space-y-1">
          {[
            {
              icon: User,
              label: "Personal Details",
              sublabel: "Name, Date of Birth, Gender",
            },
            {
              icon: MapPin,
              label: "Saved Addresses",
              sublabel: "Manage your delivery addresses",
            },
            {
              icon: CreditCard,
              label: "Payment Methods",
              sublabel: "Saved cards, UPI, Wallets",
            },
          ].map((item, index) => (
            <motion.button
              key={index}
              custom={index}
            //   variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 4 }}
              className="w-full flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 rounded-xl hover:bg-gray-50 transition text-left"
            >
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <item.icon
                  size={16}
                  className="lg:w-[18px] lg:h-[18px] text-gray-600"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs lg:text-sm">
                  {item.label}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {item.sublabel}
                </div>
              </div>
              <ChevronRight
                size={16}
                className="lg:w-[18px] lg:h-[18px] text-gray-400 flex-shrink-0"
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* General */}
      <div className="bg-white rounded-2xl p-4 lg:p-6">
        <h3 className="font-semibold mb-4 text-xs text-gray-500 uppercase tracking-wider">
          General
        </h3>
        <div className="space-y-1">
          {[
            {
              icon: HelpCircle,
              label: "Help & Support",
              sublabel: "FAQs, Contact Us, Policies",
            },
            {
              icon: Settings,
              label: "App Settings",
              sublabel: "Notifications, Languages",
            },
          ].map((item, index) => (
            <motion.button
              key={index}
              custom={index + 3}
            //   variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 4 }}
              className="w-full flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 rounded-xl hover:bg-gray-50 transition text-left"
            >
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <item.icon
                  size={16}
                  className="lg:w-[18px] lg:h-[18px] text-gray-600"
                />
              </div>
              <div className="flex-1">
                <div className="font-medium text-xs lg:text-sm">
                  {item.label}
                </div>
                <div className="text-xs text-gray-500">{item.sublabel}</div>
              </div>
              <ChevronRight
                size={16}
                className="lg:w-[18px] lg:h-[18px] text-gray-400"
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 lg:py-4 text-red-500 font-medium rounded-xl border border-gray-200 hover:bg-red-50 transition flex items-center justify-center space-x-2 text-sm lg:text-base"
      >
        <LogOut size={16} className="lg:w-[18px] lg:h-[18px]" />
        <span>Sign Out</span>
      </motion.button>
    </motion.div>
  );
}
