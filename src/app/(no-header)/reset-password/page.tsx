"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/lib/api/api.base.service";
import { useAuthModal } from "@/store/useAuthModalStore";

type ResetPasswordForm = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const openModal = useAuthModal((state) => state.openModal);

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");

  const resetMutation = useMutation({
    mutationFn: async (payload: { token: string; password: string }) => {
      const res = await authService.resetPassword(
        payload.token,
        payload.password
      );
      return res.data;
    },
    onSuccess: () => {
      router.push("/");
      openModal("login");
    },
    onError: (err: any) => {
      setError("password", {
        type: "server",
        message: err?.message || "Something went wrong",
      });
    },
  });

  const onSubmit = (data: ResetPasswordForm) => {
    if (!token) {
      setError("password", {
        type: "manual",
        message: "Token missing in URL (invalid reset link)",
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    resetMutation.mutate({
      token,
      password: data.password,
    });
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: "", color: "" };

    const hasUppercase = /[A-Z]/.test(pass);
    const hasLowercase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    const hasMinLength = pass.length >= 8;

    // All requirements must be met for Strong
    const allRequirementsMet =
      hasUppercase && hasLowercase && hasNumber && hasSpecial && hasMinLength;

    if (allRequirementsMet) {
      return { strength: 100, label: "Strong", color: "bg-green-500" };
    }

    // Count how many requirements are met
    let score = 0;
    if (hasMinLength) score += 20;
    if (hasUppercase) score += 20;
    if (hasLowercase) score += 20;
    if (hasNumber) score += 20;
    if (hasSpecial) score += 20;

    if (score < 60) return { strength: 33, label: "Weak", color: "bg-red-500" };
    return { strength: 66, label: "Medium", color: "bg-yellow-500" };
  };

  const strength = getPasswordStrength(passwordValue);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black mb-4 sm:mb-6">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
            Reset Password
          </h1>
          <p className="text-sm sm:text-base text-neutral-600">
            Create a strong new password for your account
          </p>
        </div>

        {/* Token Missing Warning */}
        {!token && (
          <div className="mb-6 rounded-full border-2 border-red-500 bg-red-50 px-5 py-3 text-sm text-red-600 text-center font-medium">
            ❌ Reset token not found in URL
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 shadow-sm">
          <div className="space-y-5 sm:space-y-6">
            {/* New Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    validate: {
                      hasUppercase: (value) =>
                        /[A-Z]/.test(value) ||
                        "Password must contain at least one uppercase letter",
                      hasLowercase: (value) =>
                        /[a-z]/.test(value) ||
                        "Password must contain at least one lowercase letter",
                      hasNumber: (value) =>
                        /[0-9]/.test(value) ||
                        "Password must contain at least one number",
                      hasSpecial: (value) =>
                        /[^A-Za-z0-9]/.test(value) ||
                        "Password must contain at least one special character",
                    },
                  })}
                  className={`w-full px-4 py-3 border-none outline outline-gray-300 rounded-full focus:outline-black transition-all
              placeholder="e.g., Handwoven Cotton Saree" ${
                errors.password ? "outline-red-500" : "outline-gray-300"
              }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordValue && (
                <div className="space-y-2 px-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-neutral-600 font-medium">
                      Password strength
                    </span>
                    <span
                      className={`font-semibold ${
                        strength.label === "Strong"
                          ? "text-green-600"
                          : strength.label === "Medium"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300 ease-out`}
                      style={{ width: `${strength.strength}%` }}
                    />
                  </div>
                </div>
              )}

              {errors.password && (
                <div className="flex items-center gap-2 text-red-600 text-xs sm:text-sm px-2">
                  <AlertCircle size={16} />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  {...register("confirmPassword", {
                    required: "Confirm password is required",
                    validate: (value) =>
                      value === passwordValue || "Passwords do not match",
                  })}
                  className={`w-full px-4 py-3 border-none outline outline-gray-300 rounded-full  focus:outline-black transition-all
              placeholder="e.g., Handwoven Cotton Saree" ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {confirmPasswordValue &&
                passwordValue === confirmPasswordValue &&
                !errors.confirmPassword && (
                  <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm px-2">
                    <CheckCircle2 size={16} />
                    <span className="font-medium">Passwords match</span>
                  </div>
                )}

              {errors.confirmPassword && (
                <div className="flex items-center gap-2 text-red-600 text-xs sm:text-sm px-2">
                  <AlertCircle size={16} />
                  <span>{errors.confirmPassword.message}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={resetMutation.isPending || !token}
              className="w-full rounded-full bg-black hover:bg-neutral-800 text-white font-semibold py-4 sm:py-4.5 px-4 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm sm:text-base"
            >
              {resetMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-5 pt-4 border-t border-neutral-200">
            <p className="text-center text-xs text-neutral-500">
              After resetting, you'll be redirected to login with your new
              password
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-neutral-500">
            🔒 Your password is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
}
