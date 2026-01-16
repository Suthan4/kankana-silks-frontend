"use client";

import { useState } from "react";
import {
  MapPin,
  Plus,
  X,
  Edit2,
  Trash2,
  Home,
  Briefcase,
  Loader2,
} from "lucide-react";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useSetDefaultAddress,
  useDeleteAddress,
} from "@/hooks/useAddresses";
import type { Address } from "@/lib/api/addresses.api";

export default function AddressesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    type: "SHIPPING" as "SHIPPING" | "BILLING" | "BOTH",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

  const { data, isLoading, error } = useAddresses();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const addresses = data?.data || [];

  const resetForm = () => {
    setFormData({
      type: "SHIPPING",
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const openModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        type: address.type,
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country,
        isDefault: address.isDefault,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAddress) {
        await updateMutation.mutateAsync({
          id: editingAddress.id,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save address:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultMutation.mutateAsync(id);
  };

  const getTypeLabel = (type: string) => {
    if (type === "BOTH") return "Home & Office";
    return type === "SHIPPING" ? "Home" : "Work";
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
                Manage your delivery locations ({addresses.length})
              </p>
            </div>
            <button
              onClick={() => openModal()}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 text-lg font-medium">
              Failed to load addresses
            </p>
            <p className="text-gray-400 text-sm mt-2">Please try again later</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No addresses saved
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Add your first delivery address
            </p>
            <button
              onClick={() => openModal()}
              className="mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Add Address
            </button>
          </div>
        ) : (
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
                        addr.type === "SHIPPING"
                          ? "bg-blue-100"
                          : "bg-purple-100"
                      }`}
                    >
                      {addr.type === "SHIPPING" ? (
                        <Home className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Briefcase className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">
                        {getTypeLabel(addr.type)}
                      </h3>
                      {addr.isDefault && (
                        <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openModal(addr)}
                      disabled={updateMutation.isPending}
                      className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-2 mb-4">
                  <p className="font-medium text-gray-900">{addr.fullName}</p>
                  <p className="text-sm text-gray-600">{addr.addressLine1}</p>
                  {addr.addressLine2 && (
                    <p className="text-sm text-gray-600">{addr.addressLine2}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
                </div>

                {/* Actions */}
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={setDefaultMutation.isPending}
                    className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    {setDefaultMutation.isPending
                      ? "Setting..."
                      : "Set as Default"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-semibold">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "SHIPPING" })}
                  className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl ${
                    formData.type === "SHIPPING"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Home className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Home</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "BILLING" })}
                  className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl ${
                    formData.type === "BILLING"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Work</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Address Line 1 *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.addressLine1}
                  onChange={(e) =>
                    setFormData({ ...formData, addressLine1: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none resize-none"
                  placeholder="House No., Building Name, Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) =>
                    setFormData({ ...formData, addressLine2: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  placeholder="Landmark, Area"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                    placeholder="560038"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  placeholder="Karnataka"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="default"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="default" className="text-sm">
                  Set as default address
                </label>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
