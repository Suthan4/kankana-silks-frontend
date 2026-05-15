// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { X, MapPin, Check } from "lucide-react";
// import { useEffect } from "react";
// import { toast } from "@/store/useToastStore";

// import { Resolver, useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

// import { useMutation, useQueryClient } from "@tanstack/react-query";

// import { addressApi } from "@/lib/api/addresses.api";

// /* -------------------------------------------------------------------------- */
// /*                                    TYPES                                   */
// /* -------------------------------------------------------------------------- */

// export interface Address {
//   id: string;
//   fullName: string;
//   phone: string;
//   addressLine1: string;
//   addressLine2?: string;
//   city: string;
//   state: string;
//   pincode: string;
//   country: string;
//   type: "SHIPPING" | "BILLING" | "BOTH";
//   isDefault: boolean;
// }

// interface AddressModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   existingAddress?: Address;
//   mode: "create" | "edit";
// }

// /* -------------------------------------------------------------------------- */
// /*                                ZOD SCHEMA                                  */
// /* -------------------------------------------------------------------------- */

// const addressSchema = z.object({
//   fullName: z.string().min(1, "Full name is required"),
//   phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
//   addressLine1: z.string().min(1, "Address is required"),
//   addressLine2: z.string().optional(),
//   city: z.string().min(1, "City is required"),
//   state: z.string().min(1, "State is required"),
//   pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
//   country: z.string().default("India"),
//   type: z.enum(["SHIPPING", "BILLING", "BOTH"]),
//   isDefault: z.boolean(),
// });

// type AddressFormData = z.infer<typeof addressSchema>;

// /* -------------------------------------------------------------------------- */
// /*                              MAIN COMPONENT                                */
// /* -------------------------------------------------------------------------- */

// export default function AddressModal({
//   isOpen,
//   onClose,
//   existingAddress,
//   mode,
// }: AddressModalProps) {
//   const queryClient = useQueryClient();

//   /* -------------------------- react-hook-form -------------------------- */

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm<AddressFormData>({
//     resolver: zodResolver(addressSchema) as Resolver<AddressFormData>,
//     defaultValues: {
//       fullName: "",
//       phone: "",
//       addressLine1: "",
//       addressLine2: "",
//       city: "",
//       state: "",
//       pincode: "",
//       country: "India",
//       type: "SHIPPING",
//       isDefault: false,
//     },
//   });

//   /* -------------------------- populate edit mode -------------------------- */

//   useEffect(() => {
//     if (existingAddress) {
//       reset({
//         fullName: existingAddress.fullName,
//         phone: existingAddress.phone,
//         addressLine1: existingAddress.addressLine1,
//         addressLine2: existingAddress.addressLine2 || "",
//         city: existingAddress.city,
//         state: existingAddress.state,
//         pincode: existingAddress.pincode,
//         country: existingAddress.country,
//         type: existingAddress.type,
//         isDefault: existingAddress.isDefault,
//       });
//     }
//   }, [existingAddress, reset]);

//   /* -------------------------- mutations -------------------------- */

//   const createAddressMutation = useMutation({
//     mutationFn: addressApi.createAddress,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["addresses"] });
//       toast.success("Address added successfully");
//       onClose();
//       reset();
//     },
//     onError: () => {
//       toast.error("Failed to add address");
//     },
//   });

//   const updateAddressMutation = useMutation({
//     mutationFn: (data: AddressFormData) =>
//       addressApi.updateAddress(existingAddress!.id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["addresses"] });
//       toast.success("Address updated successfully");
//       onClose();
//       reset();
//     },
//     onError: () => {
//       toast.error("Failed to update address");
//     },
//   });

//   /* -------------------------- submit handler -------------------------- */

//   const onSubmit = (data: AddressFormData) => {
//     if (mode === "create") {
//       createAddressMutation.mutate(data);
//     } else {
//       updateAddressMutation.mutate(data);
//     }
//   };

//   if (!isOpen) return null;

//   /* -------------------------------------------------------------------------- */
//   /*                                   UI                                       */
//   /* -------------------------------------------------------------------------- */

//   return (
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         onClick={onClose}
//       >
//         <motion.div
//           onClick={(e) => e.stopPropagation()}
//           initial={{ y: "100%" }}
//           animate={{ y: 0 }}
//           exit={{ y: "100%" }}
//           transition={{ type: "spring", damping: 30 }}
//           className="
//             w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl
//             max-h-[95vh] flex flex-col overflow-hidden
//           "
//         >
//           {/* Header */}
//           <div className="bg-main-primary p-5 text-main-secondary">
//             <button
//               onClick={onClose}
//               className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20"
//             >
//               <X />
//             </button>
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
//                 <MapPin />
//               </div>
//               <div>
//                 <h2 className="text-xl font-bold">
//                   {mode === "create" ? "Add Address" : "Edit Address"}
//                 </h2>
//                 <p className="text-sm opacity-90">Delivery address details</p>
//               </div>
//             </div>
//           </div>

//           {/* Form */}
//           <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="flex-1 overflow-y-auto p-5 space-y-4"
//           >
//             {/* Full Name */}
//             <Input
//               label="Full Name"
//               error={errors.fullName?.message}
//               {...register("fullName")}
//             />

//             {/* Phone */}
//             <Input
//               label="Phone"
//               error={errors.phone?.message}
//               {...register("phone")}
//             />

//             {/* Address Line 1 */}
//             <Input
//               label="Address Line 1"
//               error={errors.addressLine1?.message}
//               {...register("addressLine1")}
//             />

//             {/* Address Line 2 */}
//             <Input label="Address Line 2" {...register("addressLine2")} />

//             {/* City / State */}
//             <div className="grid grid-cols-2 gap-3">
//               <Input
//                 label="City"
//                 error={errors.city?.message}
//                 {...register("city")}
//               />
//               <Input
//                 label="State"
//                 error={errors.state?.message}
//                 {...register("state")}
//               />
//             </div>

//             {/* Pincode / Country */}
//             <div className="grid grid-cols-2 gap-3">
//               <Input
//                 label="Pincode"
//                 error={errors.pincode?.message}
//                 {...register("pincode")}
//               />
//               <Input label="Country" readOnly {...register("country")} />
//             </div>

//             {/* Address Type */}
//             <select
//               {...register("type")}
//               className="w-full px-4 py-3 border rounded-xl"
//             >
//               <option value="SHIPPING">SHIPPING</option>
//               <option value="BILLING">BILLING</option>
//               <option value="BOTH">BOTH</option>
//             </select>

//             {/* Default */}
//             <label className="flex items-center gap-3">
//               <input
//                 type="checkbox"
//                 {...register("isDefault")}
//                 className="w-5 h-5 text-main-primary"
//               />
//               <span className="text-sm">Set as default address</span>
//             </label>

//             {/* Footer */}
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="
//                 w-full mt-4 py-3 rounded-full font-semibold bg-main-primary text-main-secondary
//                 flex items-center justify-center gap-2 sticky bottom-2
//               "
//             >
//               <Check className="w-5 h-5" />
//               {mode === "create" ? "Save Address" : "Update Address"}
//             </button>
//           </form>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*                               INPUT HELPER                                  */
// /* -------------------------------------------------------------------------- */

// function Input({
//   label,
//   error,
//   ...props
// }: {
//   label: string;
//   error?: string;
// } & React.InputHTMLAttributes<HTMLInputElement>) {
//   return (
//     <div>
//       <label className="block text-sm font-medium mb-1">{label}</label>
//       <input
//         {...props}
//         className={`w-full px-4 py-3 border rounded-xl ${
//           error ? "border-red-500" : "border-gray-300"
//         }`}
//       />
//       {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
//     </div>
//   );
// }
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Check } from "lucide-react";
import { useEffect } from "react";
import { toast } from "@/store/useToastStore";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addressApi } from "@/lib/api/addresses.api";

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: "SHIPPING" | "BILLING" | "BOTH";
  isDefault: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingAddress?: Address;
  mode: "create" | "edit";
}

const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  country: z.string().default("India"),
  type: z.enum(["SHIPPING", "BILLING", "BOTH"]),
  isDefault: z.boolean(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddressModal({
  isOpen,
  onClose,
  existingAddress,
  mode,
}: AddressModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema) as Resolver<AddressFormData>,
    defaultValues: {
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      type: "SHIPPING",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (existingAddress) {
      reset({
        fullName: existingAddress.fullName,
        phone: existingAddress.phone,
        addressLine1: existingAddress.addressLine1,
        addressLine2: existingAddress.addressLine2 || "",
        city: existingAddress.city,
        state: existingAddress.state,
        pincode: existingAddress.pincode,
        country: existingAddress.country,
        type: existingAddress.type,
        isDefault: existingAddress.isDefault,
      });
    }
  }, [existingAddress, reset]);

  const createAddressMutation = useMutation({
    mutationFn: addressApi.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address added successfully");
      onClose();
      reset();
    },
    onError: () => {
      toast.error("Failed to add address");
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: (data: AddressFormData) =>
      addressApi.updateAddress(existingAddress!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address updated successfully");
      onClose();
      reset();
    },
    onError: () => {
      toast.error("Failed to update address");
    },
  });

  const onSubmit = (data: AddressFormData) => {
    if (mode === "create") {
      createAddressMutation.mutate(data);
    } else {
      updateAddressMutation.mutate(data);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30 }}
          className="
            w-full md:max-w-2xl bg-white
            rounded-t-3xl md:rounded-2xl
            flex flex-col
            max-h-[95vh] md:max-h-none md:h-auto
            overflow-hidden
          "
        >
          {/* ── Header ── */}
          <div className="relative bg-white px-5 py-3.5 text-black flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                {mode === "create" ? "Add Address" : "Edit Address"}
              </h2>
              <p className="text-xs opacity-80">Delivery address details</p>
            </div>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Form — scrollable only on mobile ── */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-y-auto md:overflow-visible"
          >
            <div className="px-5 py-4 space-y-3">
              {/* Row 1 — Full Name + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  label="Full Name"
                  error={errors.fullName?.message}
                  {...register("fullName")}
                />
                <CompactInput
                  label="Phone"
                  inputMode="numeric"
                  maxLength={10}
                  error={errors.phone?.message}
                  {...register("phone", {
                    onChange: (e) => {
                      // allow only numbers + max 10 digits
                      e.target.value = e.target.value
                        .replace(/\D/g, "") // remove non-numbers
                        .slice(0, 10); // limit to 10
                    },
                  })}
                />
              </div>

              {/* Row 2 — Address Line 1 */}
              <CompactInput
                label="Address Line 1"
                error={errors.addressLine1?.message}
                {...register("addressLine1")}
              />

              {/* Row 3 — Address Line 2 */}
              <CompactInput
                label="Address Line 2 (optional)"
                {...register("addressLine2")}
              />

              {/* Row 4 — City + State */}
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  label="City"
                  error={errors.city?.message}
                  {...register("city")}
                />
                <CompactInput
                  label="State"
                  error={errors.state?.message}
                  {...register("state")}
                />
              </div>

              {/* Row 5 — Pincode + Country + Type */}
              <div className="grid grid-cols-3 gap-3">
                <CompactInput
                  label="Pincode"
                  error={errors.pincode?.message}
                  {...register("pincode")}
                />
                <CompactInput
                  label="Country"
                  readOnly
                  {...register("country")}
                />
                {/* Address Type inline as compact select */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Type
                  </label>
                  <select
                    {...register("type")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-main-primary bg-white"
                  >
                    <option value="SHIPPING">Shipping</option>
                    <option value="BILLING">Billing</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
              </div>

              {/* Row 6 — Default checkbox + Submit button side by side */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      {...register("isDefault")}
                      className="hidden group"
                    />

                    <div
                      className="
      w-4 h-4 border-2 border-gray-300 rounded 
      flex items-center justify-center
      transition-colors
      group-has-[:checked]:bg-black
      group-has-[:checked]:border-black
    "
                    >
                      <Check
                        className="
        w-3 h-3 text-white 
        opacity-0 scale-75 
        transition-all duration-150
        group-has-[:checked]:opacity-100 
        group-has-[:checked]:scale-100
      "
                      />
                    </div>
                  </div>

                  <span className="text-xs text-gray-600">
                    Set as default address
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    flex items-center gap-2 px-6 py-2.5 rounded-full
                    bg-black text-white
                    text-sm font-semibold
                    hover:opacity-90 active:scale-95
                    transition-all duration-150
                    disabled:opacity-60 disabled:cursor-not-allowed
                    shrink-0
                  "
                >
                  <Check className="w-4 h-4" />
                  {mode === "create" ? "Save Address" : "Update Address"}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*                           COMPACT INPUT HELPER                             */
/* -------------------------------------------------------------------------- */

function CompactInput({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        {...props}
        className={`
          w-full px-3 py-2 border rounded-lg text-sm
          focus:outline-none focus:ring-1 focus:ring-main-primary
          read-only:bg-gray-50 read-only:text-gray-500
          ${error ? "border-red-400" : "border-gray-300"}
        `}
      />
      {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
