"use client";

import { authModalStore, useAuthModal } from "@/store/useAuthModalStore";
import {
  User,
  MapPin,
  Heart,
  Package,
  Video,
  ChevronRight,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authService } from "@/lib/api/api.base.service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/store/useToastStore";
import { z } from "zod";
import {
  useUpdateProfile,
  useChangePassword,
  useFetchProfile,
} from "@/hooks/useProfileMutation";
import { useOrders } from "@/hooks/useOrders";
import { createPortal } from "react-dom";
import clientApiService from "@/lib/api/api.client.service";
import { useQueryClient } from "@tanstack/react-query";

// Validation Schemas
const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
  phone: z
    .string()
    .regex(
      /^[6-9]\d{9}$/,
      "Invalid phone number (must start with 6-9 and be 10 digits)",
    )
    .optional()
    .or(z.literal("")),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const { user, showPasswordModal, setShowPasswordModal } = useAuthModal();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch fresh profile data on mount
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useFetchProfile();

  // Use fetched profile data or fallback to stored user
  const currentUserData = profileData || user;

  // Custom hooks for mutations
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: currentUserData?.firstName || "",
      lastName: currentUserData?.lastName || "",
      phone: currentUserData?.phone || "",
    },
  });

  // Update form when profile data changes
  useEffect(() => {
    if (currentUserData) {
      resetProfile({
        firstName: currentUserData.firstName || "",
        lastName: currentUserData.lastName || "",
        phone: currentUserData.phone || "",
      });
    }
  }, [currentUserData, resetProfile]);

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Watch password fields for real-time validation display
  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  // Form Submit Handlers
  const onSubmitProfile = (data: UpdateProfileFormData) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        setShowProfileModal(false);
        // Refetch profile to get latest data
        refetchProfile();
      },
    });
  };

  const onSubmitPassword = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        setShowPasswordModal(false);
        resetPassword();
      },
    });
  };

  // Modal Close Handlers
  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    resetProfile({
      firstName: currentUserData?.firstName || "",
      lastName: currentUserData?.lastName || "",
      phone: currentUserData?.phone || "",
    });
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    resetPassword();
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // const quickActions = [
  // {
  //   id: "orders",
  //   icon: Package,
  //   label: "My Orders",
  //   count: "3",
  //   href: "/my-account/orders",
  //   gradient: "from-blue-500 to-blue-600",
  //   bgGradient: "from-blue-50 to-blue-100",
  // },
  // {
  //   id: "video",
  //   icon: Video,
  //   label: "Video Shop",
  //   count: "1",
  //   href: "/my-account/video-appointment",
  //   gradient: "from-purple-500 to-purple-600",
  //   bgGradient: "from-purple-50 to-purple-100",
  // },
  // {
  //   id: "addresses",
  //   icon: MapPin,
  //   label: "Addresses",
  //   count: "2",
  //   href: "/my-account/addresses",
  //   gradient: "from-green-500 to-green-600",
  //   bgGradient: "from-green-50 to-green-100",
  // },
  // {
  //   id: "wishlist",
  //   icon: Heart,
  //   label: "Wishlist",
  //   count: "8",
  //   href: "/my-account/wishlist",
  //   gradient: "from-red-500 to-red-600",
  //   bgGradient: "from-red-50 to-red-100",
  // },
  // ];

  const settings = [
    {
      icon: User,
      label: "Personal Details",
      sub: "Name, Email, Phone",
      action: () => setShowProfileModal(true),
    },
    {
      icon: Lock,
      label: "Change Password",
      sub: "Update your password",
      action: () => setShowPasswordModal(true),
    },
  ];

  const handleLogout = async () => {
    try {
      await clientApiService.logout();
    } catch (error) {
      // Always clear this browser session even if the logout request fails.
      console.warn(
        "Server logout request failed; clearing local session.",
        error,
      );
    } finally {
      authModalStore.getState().logout();
      queryClient.clear();
      localStorage.removeItem("userLocation");
      localStorage.removeItem("cart-storage");
      localStorage.removeItem("auth-modal-storage");

      toast.success("Logged out successfully");
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      {/* Mobile Profile Header */}
      <div className="lg:hidden bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl ring-4 ring-white/30">
            👩
          </div>
          <div className="flex-1">
            {isLoadingProfile ? (
              <div className="space-y-2">
                <div className="h-5 w-32 bg-white/20 rounded animate-pulse" />
                <div className="h-4 w-48 bg-white/20 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <h2 className="font-bold text-xl">
                  {currentUserData?.firstName} {currentUserData?.lastName}
                </h2>
                <p className="text-sm opacity-90">{currentUserData?.email}</p>
                {currentUserData?.phone && (
                  <p className="text-sm opacity-90">{currentUserData?.phone}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Account</h1>
            <p className="text-gray-600">Manage your profile and preferences</p>
          </div>
        </div>
      </div>

      {/* Quick Actions - Enhanced Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => router.push(action.href)}
              className={`relative p-5 lg:p-6 bg-gradient-to-br ${action.bgGradient} rounded-2xl border-2 border-gray-100 hover:shadow-xl transition-all hover:scale-105 text-left group overflow-hidden`}
            >
              <div
                className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${action.gradient} opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform`}
              ></div>

              <div
                className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg`}
              >
                <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>

              <div className="font-bold text-sm lg:text-base mb-1">
                {action.label}
              </div>
              <div className="text-xs text-gray-600">{action.count} items</div>

              {action.count && (
                <div
                  className={`absolute top-3 right-3 w-6 h-6 bg-gradient-to-br ${action.gradient} text-white rounded-full text-xs flex items-center justify-center font-bold shadow-lg`}
                >
                  {action.count}
                </div>
              )}
            </button>
          );
        })} */}
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm">
        <div className="p-5 lg:p-6 border-b bg-gradient-to-r from-gray-50 to-white">
          <h3 className="font-bold text-lg">Account Settings</h3>
          <p className="text-sm text-gray-500">Manage your account details</p>
        </div>

        <div className="divide-y">
          {settings.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={item.action}
                className="w-full flex items-center gap-4 p-5 lg:p-6 hover:bg-gray-50 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-sm lg:text-base">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {item.sub}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Sign Out - Mobile Only */}
      <div className="lg:hidden">
        <button
          onClick={() => handleLogout()}
          className="w-full flex items-center justify-center gap-3 p-5 bg-white border-2 border-red-200 text-red-600 rounded-2xl font-semibold hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Update Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[999] flex items-end lg:items-center justify-center pb-20 lg:pb-0 bg-black/40 backdrop-blur-sm">
          {" "}
          <div className="bg-white w-full lg:max-w-lg rounded-t-3xl lg:rounded-2xl shadow-2xl animate-in slide-in-from-bottom lg:slide-in-from-bottom-0 fade-in duration-200 max-h-[90vh] flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <h2 className="text-xl font-bold">Personal Details</h2>
              <button
                onClick={handleCloseProfileModal}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <form
              onSubmit={handleSubmitProfile(onSubmitProfile)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* First Name */}
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    First Name *
                  </label>
                  <input
                    {...registerProfile("firstName")}
                    className={`w-full border ${
                      profileErrors.firstName
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-black/20"
                    } rounded-lg px-4 py-3 focus:ring-2 focus:border-black outline-none transition-all`}
                    placeholder="Enter first name"
                  />
                  {profileErrors.firstName && (
                    <p className="text-xs text-red-600 mt-1">
                      {profileErrors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Last Name *
                  </label>
                  <input
                    {...registerProfile("lastName")}
                    className={`w-full border ${
                      profileErrors.lastName
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-black/20"
                    } rounded-lg px-4 py-3 focus:ring-2 focus:border-black outline-none transition-all`}
                    placeholder="Enter last name"
                  />
                  {profileErrors.lastName && (
                    <p className="text-xs text-red-600 mt-1">
                      {profileErrors.lastName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Email
                  </label>
                  <input
                    value={currentUserData?.email}
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Phone
                  </label>
                  <input
                    {...registerProfile("phone")}
                    maxLength={10}
                    className={`w-full border ${
                      profileErrors.phone
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-black/20"
                    } rounded-lg px-4 py-3 focus:ring-2 focus:border-black outline-none transition-all`}
                    placeholder="Enter 10-digit phone number"
                  />
                  {profileErrors.phone ? (
                    <p className="text-xs text-red-600 mt-1">
                      {profileErrors.phone.message}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Format: 10-digit number starting with 6-9
                    </p>
                  )}
                </div>
              </div>

              {/* FOOTER */}
              <div
                className="p-4 border-t bg-white flex gap-3"
                style={{
                  paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseProfileModal}
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 border border-gray-300 rounded-lg py-3 font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 bg-black text-white rounded-lg py-3 font-medium flex items-center justify-center gap-2"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showProfileModal &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full lg:max-w-lg rounded-t-3xl lg:rounded-2xl shadow-2xl animate-in slide-in-from-bottom lg:slide-in-from-bottom-0 fade-in duration-200 max-h-[90vh] flex flex-col">
              {/* HEADER */}
              <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
                <h2 className="text-xl font-bold">Personal Details</h2>
                <button
                  onClick={handleCloseProfileModal}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* BODY */}
              <form
                onSubmit={handleSubmitProfile(onSubmitProfile)}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {/* First Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">
                      First Name *
                    </label>
                    <input
                      {...registerProfile("firstName")}
                      className={`w-full border ${
                        profileErrors.firstName
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-300 focus:ring-black/20"
                      } rounded-lg px-4 py-3 focus:ring-2 focus:border-black outline-none transition-all`}
                      placeholder="Enter first name"
                    />
                    {profileErrors.firstName && (
                      <p className="text-xs text-red-600 mt-1">
                        {profileErrors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">
                      Last Name *
                    </label>
                    <input
                      {...registerProfile("lastName")}
                      className={`w-full border ${
                        profileErrors.lastName
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-300 focus:ring-black/20"
                      } rounded-lg px-4 py-3 focus:ring-2 focus:border-black outline-none transition-all`}
                      placeholder="Enter last name"
                    />
                    {profileErrors.lastName && (
                      <p className="text-xs text-red-600 mt-1">
                        {profileErrors.lastName.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">
                      Email
                    </label>
                    <input
                      value={currentUserData?.email}
                      disabled
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">
                      Phone
                    </label>
                    <input
                      {...registerProfile("phone")}
                      maxLength={10}
                      className={`w-full border ${
                        profileErrors.phone
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-300 focus:ring-black/20"
                      } rounded-lg px-4 py-3 focus:ring-2 focus:border-black outline-none transition-all`}
                      placeholder="Enter 10-digit phone number"
                    />
                    {profileErrors.phone ? (
                      <p className="text-xs text-red-600 mt-1">
                        {profileErrors.phone.message}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        Format: 10-digit number starting with 6-9
                      </p>
                    )}
                  </div>
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t bg-white flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseProfileModal}
                    className="flex-1 border border-gray-300 rounded-lg py-3 font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-black text-white rounded-lg py-3 font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full lg:max-w-lg rounded-t-3xl lg:rounded-2xl shadow-2xl animate-in slide-in-from-bottom lg:slide-in-from-bottom-0 fade-in duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold">Change Password</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Update your account password
                </p>
              </div>
              <button
                onClick={handleClosePasswordModal}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Body - Scrollable */}
            <form
              onSubmit={handleSubmitPassword(onSubmitPassword)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Current Password */}
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      {...registerPassword("currentPassword")}
                      type={showCurrentPassword ? "text" : "password"}
                      className={`w-full border ${
                        passwordErrors.currentPassword
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-300 focus:ring-black/20"
                      } rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:border-black outline-none transition-all`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-red-600 mt-1">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      {...registerPassword("newPassword")}
                      type={showNewPassword ? "text" : "password"}
                      className={`w-full border ${
                        passwordErrors.newPassword
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-300 focus:ring-black/20"
                      } rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:border-black outline-none transition-all`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-red-600 mt-1">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      Password must contain:
                    </p>
                    <ul className="text-xs text-gray-500 space-y-0.5 ml-4">
                      <li
                        className={
                          newPassword && newPassword.length >= 8
                            ? "text-green-600 font-medium"
                            : ""
                        }
                      >
                        • At least 8 characters
                      </li>
                      <li
                        className={
                          newPassword && /[A-Z]/.test(newPassword)
                            ? "text-green-600 font-medium"
                            : ""
                        }
                      >
                        • One uppercase letter
                      </li>
                      <li
                        className={
                          newPassword && /[a-z]/.test(newPassword)
                            ? "text-green-600 font-medium"
                            : ""
                        }
                      >
                        • One lowercase letter
                      </li>
                      <li
                        className={
                          newPassword && /[0-9]/.test(newPassword)
                            ? "text-green-600 font-medium"
                            : ""
                        }
                      >
                        • One number
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      {...registerPassword("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      className={`w-full border ${
                        passwordErrors.confirmPassword
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-300 focus:ring-black/20"
                      } rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:border-black outline-none transition-all`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                  {confirmPassword &&
                    newPassword &&
                    !passwordErrors.confirmPassword && (
                      <p
                        className={`text-xs mt-1 font-medium ${
                          newPassword === confirmPassword
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {newPassword === confirmPassword
                          ? "✓ Passwords match"
                          : "✗ Passwords do not match"}
                      </p>
                    )}
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-xs text-yellow-800">
                    ⚠️ After changing your password, you will be logged out and
                    need to sign in again with your new password.
                  </p>
                </div>
              </div>
              {/* Sticky footer */}
              <div className="p-4 border-t bg-white flex gap-3 sticky bottom-0">
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  disabled={changePasswordMutation.isPending}
                  className="flex-1 border border-gray-300 rounded-lg py-3 font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="flex-1 bg-black text-white rounded-lg py-3 font-medium flex items-center justify-center gap-2"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
