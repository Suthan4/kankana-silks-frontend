"use client";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { type FormEvent, useEffect, useState } from "react";
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
import { z } from "zod";
import { authService } from "@/lib/api/api.base.service";
import { useQueryClient } from "@tanstack/react-query";

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
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOtpMode, setMobileOtpMode] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const queryClient = useQueryClient();

  // Reset form when mode changes
  useEffect(() => {
    setMobileOtpMode(false);
    setMobileNumber("");
    setMobileOtp("");
    setOtpSent(false);
    setLoginErrors({});
    setRegisterErrors({});
    setForgotErrors({});
    setApiError("");
  }, [mode]);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useModalScrollLock(isOpen);

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginErrors({});
    setApiError("");

    try {
      const validatedData = loginSchema.parse(loginData);
      setIsLoading(true);

      const res = await authService.login({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (res.data.data) {
        const { accessToken, refreshToken, user } = res.data.data;

        // ✅ 1. Set auth
        setAuth(accessToken, user, refreshToken);

        // ✅ 2. 🔥 CLEAR OLD QUERIES (THIS FIXES YOUR ISSUE)
        queryClient.clear();
      }

      // ✅ 3. Close modal
      closeModal();

      console.log("Login successful", res);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof LoginFormData, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setLoginErrors(errors);
      } else {
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
      const validatedData = RegisterDTOSchema.parse(registerData);
      setIsLoading(true);
      const res = await authService.register({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        password: validatedData.password,
        phone: validatedData.phone,
        termsAccepted: validatedData.termsAccepted,
      });

      if (res.data.data) {
        const { accessToken, refreshToken, user } = res.data.data;
        setAuth(accessToken, user, refreshToken);
      }

      console.log("validatedData", validatedData);
      closeModal();
      console.log(
        "Registration successful - user logged in automatically",
        res,
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof RegisterDTO, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof RegisterDTO] = err.message;
          }
        });
        setRegisterErrors(errors);
      } else {
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
      const validatedData = forgotPasswordSchema.parse(forgotData);
      setIsLoading(true);

      const res = await authService.forgotPassword({
        email: validatedData.email,
      });

      setApiError("");
      alert(
        "Password reset link sent! Please check your inbox. If you don't see it, check your Spam/Junk folder (email sent from no-reply@kankanasilks.com).",
      );
      setMode("login");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof ForgotPasswordFormData, string>> =
          {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof ForgotPasswordFormData] = err.message;
          }
        });
        setForgotErrors(errors);
      } else {
        setApiError("Failed to send reset link. Please try again.");
        console.error("Forgot password error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 z-50"
        onClick={closeModal}
        role="presentation"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-2xl shadow-2xl w-full max-w-sm h-auto flex flex-col bg-white"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header - Compact mobile-first */}
          <div className="relative bg-gradient-to-br from-gray-50 to-white px-4 py-2 sm:px-6 sm:pt-6 sm:pb-4 text-black flex-shrink-0 border-b border-gray-100">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 hover:bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex justify-center mb-2">
              <motion.img
                src="/image-removebg-preview.png"
                width={316}
                height={152}
                alt="Kankana Silks"
                layoutId={isMobile ? "mobile-logo" : "desktop-logo"}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  mass: 0.6,
                }}
                className="h-9 w-auto object-contain"
              />
            </div>
            <h2
              id="modal-title"
              className="text-lg sm:text-xl font-bold text-center"
            >
              {mode === "login"
                ? "Welcome Back"
                : mode === "register"
                  ? "Create Account"
                  : "Reset Password"}
            </h2>
            <p className="text-center text-xs sm:text-sm opacity-70 mt-1">
              {mode === "login"
                ? "Sign in to continue"
                : mode === "register"
                  ? "Join Kankana Silks"
                  : "We'll send you a reset link"}
            </p>
          </div>

          {/* Form - Non-scrollable, compact */}
          <div className="bg-white px-4 py-4 sm:px-6 sm:py-6 flex-1 flex flex-col overflow-hidden">
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
              >
                <AlertCircle
                  className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-xs sm:text-sm text-red-700">{apiError}</p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* Login Form */}
              {mode === "login" && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className="space-y-4"
                  onSubmit={mobileOtpMode ? async (e) => {
                    e.preventDefault();
                    setApiError("");
                    if (!/^[6-9]\\d{9}$/.test(mobileNumber)) {
                      setApiError("Enter a valid 10-digit mobile number.");
                      return;
                    }
                    setIsLoading(true);
                    try {
                      if (!otpSent) {
                        await authService.sendMobileOtp(mobileNumber);
                        setOtpSent(true);
                      } else {
                        const response = await authService.verifyMobileOtp(mobileNumber, mobileOtp);
                        const payload = response.data?.data;
                        if (payload?.user && payload?.accessToken) {
                          setAuth(payload.accessToken, payload.user, payload.refreshToken);
                          queryClient.clear();
                          closeModal();
                        } else {
                          setApiError(response.data?.message || "Unable to sign in.");
                        }
                      }
                    } catch (error: any) {
                      setApiError(error?.response?.data?.message || "Something went wrong. Please try again.");
                    } finally {
                      setIsLoading(false);
                    }
                  } : handleLoginSubmit}
                >
                  {!mobileOtpMode ? (
                    <>
                      <div>
                        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                          <input id="login-email" type="email" placeholder="name@example.com" autoComplete="email"
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} value={loginData.email} disabled={isLoading} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                          <input id="login-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password"
                            className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} value={loginData.password} disabled={isLoading} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1" aria-label={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="button" onClick={() => setMode("forgot")} className="text-sm text-gray-700 hover:text-black font-medium">Forgot password?</button>
                      </div>
                      <button type="submit" disabled={isLoading} className="w-full bg-black text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50">
                        {isLoading ? "Signing in..." : "Sign in"}
                      </button>
                      <div className="relative py-1"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">OR</span></div></div>
                      <button type="button" onClick={() => { setMobileOtpMode(true); setApiError(""); }} className="w-full border border-gray-300 text-gray-900 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition">
                        Continue with mobile OTP
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">{otpSent ? "Verify your number" : "Sign in with mobile"}</p>
                        <button type="button" onClick={() => { setMobileOtpMode(false); setOtpSent(false); setMobileOtp(""); setApiError(""); }} className="text-xs text-gray-500 hover:text-black">Use email instead</button>
                      </div>
                      <div>
                        <label htmlFor="mobile-number" className="block text-sm font-medium text-gray-700 mb-1.5">Mobile number</label>
                        <div className="flex rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-black">
                          <span className="px-3 py-2.5 text-sm text-gray-500 border-r border-gray-200">+91</span>
                          <input id="mobile-number" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="10-digit mobile number"
                            className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none rounded-r-lg" value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/\\D/g, "").slice(0, 10))} disabled={isLoading || otpSent} />
                        </div>
                      </div>
                      {otpSent && (
                        <div>
                          <label htmlFor="mobile-otp" className="block text-sm font-medium text-gray-700 mb-1.5">6-digit OTP</label>
                          <input id="mobile-otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="Enter OTP"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm tracking-[0.3em]"
                            value={mobileOtp} onChange={(e) => setMobileOtp(e.target.value.replace(/\\D/g, "").slice(0, 6))} disabled={isLoading} />
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">OTP expires in 5 minutes.</span>
                            <button type="button" disabled={isLoading} onClick={async () => { setIsLoading(true); setApiError(""); try { await authService.resendMobileOtp(mobileNumber); setMobileOtp(""); } catch (error: any) { setApiError(error?.response?.data?.message || "Unable to resend OTP."); } finally { setIsLoading(false); } }} className="text-xs font-medium text-gray-800 underline disabled:opacity-50">Resend OTP</button>
                          </div>
                        </div>
                      )}
                      <button type="submit" disabled={isLoading || (otpSent && mobileOtp.length !== 6)} className="w-full bg-black text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50">
                        {isLoading ? "Please wait..." : otpSent ? "Verify & sign in" : "Send OTP"}
                      </button>
                      <p className="text-xs text-center text-gray-500">Standard SMS charges may apply. By continuing, you agree to our Terms and Privacy Policy.</p>
                    </>
                  )}
                  <p className="text-center text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <button type="button" onClick={() => setMode("register")} className="text-black font-medium hover:underline">Sign up</button>
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
                  className="space-y-3 sm:space-y-4"
                  onSubmit={handleRegisterSubmit}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="register-firstname"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5"
                      >
                        First Name
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                          aria-hidden="true"
                        />
                        <input
                          id="register-firstname"
                          type="text"
                          placeholder="Aisha"
                          className={`w-full pl-9 pr-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition text-sm sm:text-base ${
                            registerErrors.firstName
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300 bg-white"
                          }`}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              firstName: e.target.value,
                            })
                          }
                          value={registerData.firstName}
                          disabled={isLoading}
                          aria-invalid={!!registerErrors.firstName}
                          aria-describedby={
                            registerErrors.firstName
                              ? "register-firstname-error"
                              : undefined
                          }
                        />
                      </div>
                      {registerErrors.firstName && (
                        <p
                          id="register-firstname-error"
                          className="mt-1 text-xs text-red-500"
                        >
                          {registerErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="register-lastname"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5"
                      >
                        Last Name
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                          aria-hidden="true"
                        />
                        <input
                          id="register-lastname"
                          type="text"
                          placeholder="Kapoor"
                          className={`w-full pl-9 pr-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition text-sm sm:text-base ${
                            registerErrors.lastName
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300 bg-white"
                          }`}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              lastName: e.target.value,
                            })
                          }
                          value={registerData.lastName}
                          disabled={isLoading}
                          aria-invalid={!!registerErrors.lastName}
                          aria-describedby={
                            registerErrors.lastName
                              ? "register-lastname-error"
                              : undefined
                          }
                        />
                      </div>
                      {registerErrors.lastName && (
                        <p
                          id="register-lastname-error"
                          className="mt-1 text-xs text-red-500"
                        >
                          {registerErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="register-phone"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Phone
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        id="register-phone"
                        type="tel"
                        placeholder="9876543210"
                        className={`w-full pl-9 pr-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition text-sm sm:text-base ${
                          registerErrors.phone
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white"
                        }`}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            phone: e.target.value,
                          })
                        }
                        value={registerData.phone}
                        disabled={isLoading}
                        aria-invalid={!!registerErrors.phone}
                        aria-describedby={
                          registerErrors.phone
                            ? "register-phone-error"
                            : undefined
                        }
                      />
                    </div>
                    {registerErrors.phone && (
                      <p
                        id="register-phone-error"
                        className="mt-1 text-xs text-red-500"
                      >
                        {registerErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="register-email"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        id="register-email"
                        type="email"
                        placeholder="name@example.com"
                        className={`w-full pl-9 pr-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition text-sm sm:text-base ${
                          registerErrors.email
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white"
                        }`}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                        value={registerData.email}
                        disabled={isLoading}
                        aria-invalid={!!registerErrors.email}
                        aria-describedby={
                          registerErrors.email
                            ? "register-email-error"
                            : undefined
                        }
                      />
                    </div>
                    {registerErrors.email && (
                      <p
                        id="register-email-error"
                        className="mt-1 text-xs text-red-500"
                      >
                        {registerErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="register-password"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-10 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition text-sm sm:text-base ${
                          registerErrors.password
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white"
                        }`}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password: e.target.value,
                          })
                        }
                        value={registerData.password}
                        disabled={isLoading}
                        aria-invalid={!!registerErrors.password}
                        aria-describedby={
                          registerErrors.password
                            ? "register-password-error"
                            : undefined
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-black rounded p-1"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {registerErrors.password && (
                      <p
                        id="register-password-error"
                        className="mt-1 text-xs text-red-500"
                      >
                        {registerErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-start gap-2 cursor-pointer hover:text-gray-700">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-black rounded focus:ring-2 focus:ring-black mt-0.5"
                        checked={registerData.termsAccepted}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            termsAccepted: e.target.checked,
                          })
                        }
                        disabled={isLoading}
                        aria-invalid={!!registerErrors.termsAccepted}
                        aria-describedby={
                          registerErrors.termsAccepted
                            ? "register-terms-error"
                            : undefined
                        }
                      />

                      <span className="text-xs text-gray-600 leading-tight">
                        I agree to the{" "}
                        <a
                          href="/terms-and-conditions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium hover:text-black"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium hover:text-black"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                    {registerErrors.termsAccepted && (
                      <p
                        id="register-terms-error"
                        className="mt-1 text-xs text-red-500"
                      >
                        {registerErrors.termsAccepted}
                      </p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    disabled={isLoading}
                    className="w-full bg-black text-white py-2 sm:py-2.5 rounded-lg font-semibold shadow-md text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </motion.button>

                  <p className="text-center text-xs sm:text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-black hover:text-black/60 font-medium focus:outline-none focus:ring-2 focus:ring-black rounded px-1"
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
                  <p className="text-xs sm:text-sm text-gray-600 text-center">
                    Enter your email and we'll send you a link to reset your
                    password
                  </p>

                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        id="forgot-email"
                        type="email"
                        placeholder="name@example.com"
                        className={`w-full pl-9 pr-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition text-sm sm:text-base ${
                          forgotErrors.email
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white"
                        }`}
                        onChange={(e) =>
                          setForgotData({ email: e.target.value })
                        }
                        value={forgotData.email}
                        disabled={isLoading}
                        aria-invalid={!!forgotErrors.email}
                        aria-describedby={
                          forgotErrors.email ? "forgot-email-error" : undefined
                        }
                      />
                    </div>
                    {forgotErrors.email && (
                      <p
                        id="forgot-email-error"
                        className="mt-1 text-xs text-red-500"
                      >
                        {forgotErrors.email}
                      </p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    disabled={isLoading}
                    className="w-full bg-black text-white py-2 sm:py-2.5 rounded-lg font-semibold shadow-md text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="w-full text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black rounded px-1 py-2"
                  >
                    ← Back to Sign In
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
