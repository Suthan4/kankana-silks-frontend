"use client";

import { useState } from "react";
import {
  MapPin,
  Plus,
  X,
  Check,
  Edit2,
  Trash2,
  Home,
  Briefcase,
} from "lucide-react";

export default function AddressesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: "home",
      name: "Aisha Kapoor",
      address: "123 MG Road, Indiranagar",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560038",
      phone: "+91 98765 43210",
      isDefault: true,
    },
    {
      id: 2,
      type: "work",
      name: "Aisha Kapoor",
      address: "45 Tech Park, Whitefield",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560066",
      phone: "+91 98765 43210",
      isDefault: false,
    },
  ]);

  const setDefault = (id: number) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 lg:p-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-semibold">
                Saved Addresses
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your delivery locations
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Addresses Grid */}
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-xl p-5 border-2 transition-all hover:shadow-lg ${
                addr.isDefault ? "border-black" : "border-gray-200"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      addr.type === "home" ? "bg-blue-100" : "bg-purple-100"
                    }`}
                  >
                    {addr.type === "home" ? (
                      <Home className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold capitalize">{addr.type}</h3>
                    {addr.isDefault && (
                      <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-2 mb-4">
                <p className="font-medium text-gray-900">{addr.name}</p>
                <p className="text-sm text-gray-600">{addr.address}</p>
                <p className="text-sm text-gray-600">
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
              </div>

              {/* Actions */}
              {!addr.isDefault && (
                <button
                  onClick={() => setDefault(addr.id)}
                  className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-semibold">Add New Address</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 p-4 border-2 border-blue-500 bg-blue-50 rounded-xl"
                >
                  <Home className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Home</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  <Briefcase className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Work</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Address
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none resize-none"
                  placeholder="House No., Building Name, Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                    placeholder="560038"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  placeholder="State"
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="default" className="w-4 h-4" />
                <label htmlFor="default" className="text-sm">
                  Set as default address
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
