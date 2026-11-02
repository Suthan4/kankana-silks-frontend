"use client";

import { useEffect, useState } from "react";
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

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const addressSchema = z.object({
  type: z.enum(["SHIPPING", "BILLING", "BOTH"]),

  fullName: z.string().min(2, "Full name is required").max(60),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter valid 10-digit phone number"),

  addressLine1: z.string().min(5, "Address is too short"),

  addressLine2: z.string().optional(),

  city: z.string().min(2, "City is required"),

  state: z.string().min(2, "State is required"),

  pincode: z.string().regex(/^\d{6}$/, "Enter valid 6-digit pincode"),

  country: z.string(),

  isDefault: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export default function AddressesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (!isModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        reset();
        setEditingAddress(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, reset]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
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
    },
  });
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

      reset({
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
      reset();
      setEditingAddress(null);
    }

    setIsModalOpen(true);
  };

  const onSubmit = async (values: AddressFormValues) => {
    try {
      if (editingAddress) {
        await updateMutation.mutateAsync({
          id: editingAddress.id,
          data: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }

      setIsModalOpen(false);
      reset();
      setEditingAddress(null);
    } catch (err) {
      console.error(err);
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

      {/* Add/Edit Address — mobile-first iOS style sheet */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/45 backdrop-blur-[2px] md:items-center md:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsModalOpen(false);
              reset();
              resetForm();
            }
          }}
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-modal-title"
            className="flex w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl md:max-h-[min(820px,90dvh)] md:rounded-[28px]"
            style={{
              height: "min(88dvh, 760px)",
              maxHeight: "calc(100dvh - env(safe-area-inset-top) - 12px)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            {/* Drag handle + fixed header */}
            <div className="shrink-0 border-b border-gray-100 bg-white px-5 pb-4 pt-3">
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-300 md:hidden" />
              <div className="flex items-center justify-between">
                <div>
                  <h2 id="address-modal-title" className="text-[18px] font-semibold tracking-tight text-gray-950">
                    {editingAddress ? "Edit Address" : "Add New Address"}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">Your delivery details</p>
                </div>
                <button
                  type="button"
                  aria-label="Close address form"
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                    resetForm();
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200 active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              id="address-editor-form" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-8 space-y-5 sm:px-6"
            >
              {/* Address Type */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue("type", "SHIPPING")}
                  className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl transition-all ${
                    watch("type") === "SHIPPING"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Home
                    className={`w-5 h-5 ${
                      watch("type") === "SHIPPING" ? "text-white" : "text-black"
                    }`}
                  />
                  <span className="font-medium">Home</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue("type", "BILLING")}
                  className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl transition-all ${
                    watch("type") === "BILLING"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Briefcase
                    className={`w-5 h-5 ${
                      watch("type") === "BILLING" ? "text-white" : "text-black"
                    }`}
                  />
                  <span className="font-medium">Work</span>
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name *
                </label>

                <input
                  {...register("fullName")}
                  type="text"
                  placeholder="Enter full name"
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-all text-base sm:text-sm ${
                    errors.fullName
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-black/10 focus:border-black"
                  }`}
                />

                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number *
                </label>

                <input
                  {...register("phone")}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="81111221111"
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                  }}
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-all text-base sm:text-sm ${
                    errors.phone
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-black/10 focus:border-black"
                  }`}
                />

                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Address 1 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Address Line 1 *
                </label>

                <textarea
                  {...register("addressLine1")}
                  rows={3}
                  placeholder="House No., Building Name, Street"
                  className={`w-full px-4 py-3 border rounded-xl outline-none resize-none transition-all text-sm ${
                    errors.addressLine1
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-black/10 focus:border-black"
                  }`}
                />

                {errors.addressLine1 && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.addressLine1.message}
                  </p>
                )}
              </div>

              {/* Address 2 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Address Line 2
                </label>

                <input
                  {...register("addressLine2")}
                  type="text"
                  placeholder="Landmark, Area"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none transition-all focus:ring-2 focus:ring-black/10 focus:border-black text-base sm:text-sm"
                />
              </div>

              {/* City + Pincode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    City *
                  </label>

                  <input
                    {...register("city")}
                    type="text"
                    placeholder="City"
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition-all text-base sm:text-sm ${
                      errors.city
                        ? "border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 focus:ring-2 focus:ring-black/10 focus:border-black"
                    }`}
                  />

                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pincode *
                  </label>

                  <input
                    {...register("pincode")}
                    type="text"
                    inputMode="numeric"
                    placeholder="560038"
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition-all text-base sm:text-sm ${
                      errors.pincode
                        ? "border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 focus:ring-2 focus:ring-black/10 focus:border-black"
                    }`}
                  />

                  {errors.pincode && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.pincode.message}
                    </p>
                  )}
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  State *
                </label>

                <input
                  {...register("state")}
                  type="text"
                  placeholder="Karnataka"
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-all text-base sm:text-sm ${
                    errors.state
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-black/10 focus:border-black"
                  }`}
                />

                {errors.state && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.state.message}
                  </p>
                )}
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="default"
                  {...register("isDefault")}
                  className="w-4 h-4 accent-black rounded border-gray-300"
                />

                <label htmlFor="default" className="text-sm text-gray-700">
                  Set as default address
                </label>
              </div>


            </form>

            {/* Fixed action area: stays visible while the fields scroll */}
            <div className="shrink-0 border-t border-gray-100 bg-white px-5 pt-3 sm:px-6"
              style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom))" }}
            >
              <button
                type="submit"
                form="address-editor-form"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingAddress ? (
                  "Update Address"
                ) : (
                  "Save Address"
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
