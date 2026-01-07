"use client";
import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  AlertCircle,
} from "lucide-react";
import { useAuthModal } from "@/store/useAuthModalStore";
import apiService from "@/lib/api/api.admin.service";
import { z } from "zod";

// Zod Schemas
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

export const RegisterDTOSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
});

export type RegisterDTO = z.infer<typeof RegisterDTOSchema>;

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function AuthModal() {
  const { isOpen, mode, closeModal, setMode, setAuth } = useAuthModal();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [registerData, setRegisterData] = useState<RegisterDTO>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    termsAccepted: false,
  });
  const [forgotData, setForgotData] = useState<ForgotPasswordFormData>({
    email: "",
  });

  // Error states
  const [loginErrors, setLoginErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [registerErrors, setRegisterErrors] = useState<
    Partial<Record<keyof RegisterDTO, string>>
  >({});
  const [forgotErrors, setForgotErrors] = useState<
    Partial<Record<keyof ForgotPasswordFormData, string>>
  >({});
  const [apiError, setApiError] = useState<string>("");

  // Reset form when mode changes
  useEffect(() => {
    setLoginErrors({});
    setRegisterErrors({});
    setForgotErrors({});
    setApiError("");
  }, [mode]);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginErrors({});
    setApiError("");

    try {
      // Validate with Zod
      const validatedData = loginSchema.parse(loginData);
      setIsLoading(true);

      const res = await apiService.login({
        email: validatedData.email,
        password: validatedData.password,
      });

      // Store auth data
      if (res.data.data) {
        const { accessToken, user } = res.data.data;
        setAuth(accessToken, user);
      }

      closeModal();
      console.log("Login successful", res);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const errors: Partial<Record<keyof LoginFormData, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setLoginErrors(errors);
      } else {
        // Handle API errors
        setApiError("Invalid email or password. Please try again.");
        console.error("Login error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterErrors({});
    setApiError("");

    try {
      // Validate with Zod
      const validatedData = RegisterDTOSchema.parse(registerData);
      setIsLoading(true);

      const res = await apiService.register({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        password: validatedData.password,
        phone: validatedData.phone,
      });

      // Store auth data if registration returns tokens
      if (res.data.data) {
        const { accessToken, user } = res.data.data;
        setAuth(accessToken, user);
      }

      closeModal();
      console.log("Registration successful", res);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const errors: Partial<Record<keyof RegisterDTO, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof RegisterDTO] = err.message;
          }
        });
        setRegisterErrors(errors);
      } else {
        // Handle API errors
        setApiError("Registration failed. Please try again.");
        console.error("Registration error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotErrors({});
    setApiError("");

    try {
      // Validate with Zod
      const validatedData = forgotPasswordSchema.parse(forgotData);
      setIsLoading(true);

      const res = await apiService.forgotPassword({
        email: validatedData.email,
      });

      // Show success message or redirect
      setApiError(""); // Clear any previous errors
      alert("Password reset link sent! Check your email.");
      setMode("login");
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const errors: Partial<Record<keyof ForgotPasswordFormData, string>> =
          {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof ForgotPasswordFormData] = err.message;
          }
        });
        setForgotErrors(errors);
      } else {
        // Handle API errors
        setApiError("Failed to send reset link. Please try again.");
        console.error("Forgot password error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render until mounted
  if (!mounted || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
        onClick={closeModal}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden my-auto flex flex-col"
        >
          {/* Header - Fixed */}
          <div className="relative bg-white/80 p-4 sm:p-6 text-black flex-shrink-0">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
            >
              <User className="w-6 h-6 sm:w-8 sm:h-8" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold text-center">
              {mode === "login"
                ? "Welcome Back"
                : mode === "register"
                ? "Create Account"
                : "Reset Password"}
            </h2>
            <p className="text-center text-xs sm:text-sm opacity-90 mt-1">
              {mode === "login"
                ? "Sign in to continue"
                : mode === "register"
                ? "Join Kankana Silks"
                : "We'll send you a reset link"}
            </p>
          </div>

          {/* Form - Scrollable */}
          <div className="bg-white p-4 sm:p-4 sm:py-6 overflow-y-auto flex-1">
            {/* API Error Message */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{apiError}</p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* Login Form */}
              {mode === "login" && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                  onSubmit={handleLoginSubmit}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="name@example.com"
                        className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition text-sm sm:text-base ${
                          loginErrors.email
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        value={loginData.email}
                        disabled={isLoading}
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {loginErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-12 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition text-sm sm:text-base ${
                          loginErrors.password
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        value={loginData.password}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="mt-1 text-xs text-red-500">
                        {loginErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-amber-400 rounded"
                      />
                      <span className="text-xs sm:text-sm text-gray-600">
                        Remember me
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs sm:text-sm text-black hover:text-black/50 font-medium"
                    >
                      Forgot?
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    disabled={isLoading}
                    className="w-full bg-black text-white py-2.5 sm:py-3 rounded-full font-semibold shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </motion.button>

                  <p className="text-center text-xs sm:text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="text-black hover:text-black/50 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </motion.form>
              )}

              {/* Register Form */}
              {mode === "register" && (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                  onSubmit={handleRegisterSubmit}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Aisha Kapoor"
                          className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition text-sm sm:text-base ${
                            registerErrors.firstName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              firstName: e.target.value,
                            })
                          }
                          value={registerData.firstName}
                          disabled={isLoading}
                        />
                      </div>
                      {registerErrors.firstName && (
                        <p className="mt-1 text-xs text-red-500">
                          {registerErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Aisha Kapoor"
                          className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition text-sm sm:text-base ${
                            registerErrors.lastName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              lastName: e.target.value,
                            })
                          }
                          value={registerData.lastName}
                          disabled={isLoading}
                        />
                      </div>
                      {registerErrors.lastName && (
                        <p className="mt-1 text-xs text-red-500">
                          {registerErrors.lastName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Aisha Kapoor"
                          className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition text-sm sm:text-base ${
                            registerErrors.phone
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              phone: e.target.value,
                            })
                          }
                          value={registerData.phone}
                          disabled={isLoading}
                        />
                      </div>
                      {registerErrors.phone && (
                        <p className="mt-1 text-xs text-red-500">
                          {registerErrors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          placeholder="name@example.com"
                          className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition text-sm sm:text-base ${
                            registerErrors.email
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              email: e.target.value,
                            })
                          }
                          value={registerData.email}
                          disabled={isLoading}
                        />
                      </div>
                      {registerErrors.email && (
                        <p className="mt-1 text-xs text-red-500">
                          {registerErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-12 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition text-sm sm:text-base ${
                            registerErrors.password
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              password: e.target.value,
                            })
                          }
                          value={registerData.password}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {registerErrors.password && (
                        <p className="mt-1 text-xs text-red-500">
                          {registerErrors.password}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className={`w-4 h-4 mt-0.5 accent-amber-400 rounded flex-shrink-0 ${
                          registerErrors ? "border-red-500" : ""
                        }`}
                        checked={registerData.termsAccepted}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            termsAccepted: e.target.checked,
                          })
                        }
                        disabled={isLoading}
                      />
                      <span className="text-xs text-gray-600">
                        I agree to the Terms of Service and Privacy Policy
                      </span>
                    </label>
                    {registerErrors.termsAccepted && (
                      <p className="mt-1 text-xs text-red-500">
                        {registerErrors.termsAccepted}
                      </p>
                    )}
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    disabled={isLoading}
                    className="w-full bg-black text-white py-2.5 sm:py-3 rounded-full font-semibold shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </motion.button>

                  <p className="text-center text-xs sm:text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-black hover:text-black/50 font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </motion.form>
              )}

              {/* Forgot Password Form */}
              {mode === "forgot" && (
                <motion.form
                  key="forgot"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                  onSubmit={handleForgotSubmit}
                >
                  <p className="text-xs sm:text-sm text-gray-600 text-center mb-4">
                    Enter your email and we'll send you a link to reset your
                    password
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition text-sm sm:text-base ${
                          forgotErrors.email
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) =>
                          setForgotData({ email: e.target.value })
                        }
                        value={forgotData.email}
                        disabled={isLoading}
                      />
                    </div>
                    {forgotErrors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {forgotErrors.email}
                      </p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-white py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="w-full text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    ← Back to Sign In
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Social Login */}
            {mode !== "forgot" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  {/* <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div> */}
                </div>

                {/* <div className="grid grid-cols-2 gap-3 mt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 py-2 sm:py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium">
                      Google
                    </span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 py-2 sm:py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <span className="text-xs sm:text-sm font-medium">
                      Phone
                    </span>
                  </motion.button>
                </div> */}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
