// "use client";
// import { FormEvent, useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   X,
//   User,
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   Phone,
//   AlertCircle,
// } from "lucide-react";
// import { useAuthModal } from "@/store/useAuthModalStore";
// import { z } from "zod";
// import { authService } from "@/lib/api/api.base.service";

// // Zod Schemas
// const loginSchema = z.object({
//   email: z.string().min(1, "Email is required").email("Invalid email address"),
//   password: z
//     .string()
//     .min(6, "Password must be at least 6 characters")
//     .max(100, "Password is too long"),
// });

// export const RegisterDTOSchema = z.object({
//   email: z.string().email("Invalid email format"),
//   password: z
//     .string()
//     .min(8, "Password must be at least 8 characters")
//     .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
//     .regex(/[a-z]/, "Password must contain at least one lowercase letter")
//     .regex(/[0-9]/, "Password must contain at least one number"),
//   firstName: z.string().min(1, "First name is required").max(50),
//   lastName: z.string().min(1, "Last name is required").max(50),
//   termsAccepted: z.boolean().refine((val) => val === true, {
//     message: "You must accept the terms and conditions",
//   }),
//   phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
// });

// export type RegisterDTO = z.infer<typeof RegisterDTOSchema>;

// const forgotPasswordSchema = z.object({
//   email: z.string().min(1, "Email is required").email("Invalid email address"),
// });

// type LoginFormData = z.infer<typeof loginSchema>;
// type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// export default function AuthModal() {
//   const { isOpen, mode, closeModal, setMode, setAuth } = useAuthModal();
//   const [mounted, setMounted] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   // Form states
//   const [loginData, setLoginData] = useState<LoginFormData>({
//     email: "",
//     password: "",
//   });
//   const [registerData, setRegisterData] = useState<RegisterDTO>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     phone: "",
//     termsAccepted: false,
//   });
//   const [forgotData, setForgotData] = useState<ForgotPasswordFormData>({
//     email: "",
//   });

//   // Error states
//   const [loginErrors, setLoginErrors] = useState<
//     Partial<Record<keyof LoginFormData, string>>
//   >({});
//   const [registerErrors, setRegisterErrors] = useState<
//     Partial<Record<keyof RegisterDTO, string>>
//   >({});
//   const [forgotErrors, setForgotErrors] = useState<
//     Partial<Record<keyof ForgotPasswordFormData, string>>
//   >({});
//   const [apiError, setApiError] = useState<string>("");

//   // Reset form when mode changes
//   useEffect(() => {
//     setLoginErrors({});
//     setRegisterErrors({});
//     setForgotErrors({});
//     setApiError("");
//   }, [mode]);

//   // Prevent hydration mismatch
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Prevent body scroll when modal is open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }
//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen]);

//   const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoginErrors({});
//     setApiError("");

//     try {
//       const validatedData = loginSchema.parse(loginData);
//       setIsLoading(true);

//       const res = await authService.login({
//         email: validatedData.email,
//         password: validatedData.password,
//       });

//       if (res.data.data) {
//         const { accessToken, refreshToken, user } = res.data.data;

//         // Store in Zustand (which persists to localStorage automatically)
//         setAuth(accessToken, user, refreshToken);
//       }

//       closeModal();
//       console.log("Login successful", res);
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         const errors: Partial<Record<keyof LoginFormData, string>> = {};
//         error.issues.forEach((err) => {
//           if (err.path[0]) {
//             errors[err.path[0] as keyof LoginFormData] = err.message;
//           }
//         });
//         setLoginErrors(errors);
//       } else {
//         setApiError("Invalid email or password. Please try again.");
//         console.error("Login error:", error);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setRegisterErrors({});
//     setApiError("");

//     try {
//       const validatedData = RegisterDTOSchema.parse(registerData);
//       setIsLoading(true);

//       const res = await authService.register({
//         firstName: validatedData.firstName,
//         lastName: validatedData.lastName,
//         email: validatedData.email,
//         password: validatedData.password,
//         phone: validatedData.phone,
//       });

//       if (res.data.data) {
//         const { accessToken, refreshToken, user } = res.data.data;

//         // Store in Zustand (which persists to localStorage automatically)
//         setAuth(accessToken, user, refreshToken);
//       }

//       closeModal();
//       console.log(
//         "Registration successful - user logged in automatically",
//         res
//       );
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         const errors: Partial<Record<keyof RegisterDTO, string>> = {};
//         error.issues.forEach((err) => {
//           if (err.path[0]) {
//             errors[err.path[0] as keyof RegisterDTO] = err.message;
//           }
//         });
//         setRegisterErrors(errors);
//       } else {
//         setApiError("Registration failed. Please try again.");
//         console.error("Registration error:", error);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleForgotSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setForgotErrors({});
//     setApiError("");

//     try {
//       const validatedData = forgotPasswordSchema.parse(forgotData);
//       setIsLoading(true);

//       const res = await authService.forgotPassword({
//         email: validatedData.email,
//       });

//       setApiError("");
//       alert("Password reset link sent! Check your email.");
//       setMode("login");
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         const errors: Partial<Record<keyof ForgotPasswordFormData, string>> =
//           {};
//         error.issues.forEach((err) => {
//           if (err.path[0]) {
//             errors[err.path[0] as keyof ForgotPasswordFormData] = err.message;
//           }
//         });
//         setForgotErrors(errors);
//       } else {
//         setApiError("Failed to send reset link. Please try again.");
//         console.error("Forgot password error:", error);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!mounted || !isOpen) return null;

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
//         onClick={closeModal}
//       >
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0, y: 20 }}
//           animate={{ scale: 1, opacity: 1, y: 0 }}
//           exit={{ scale: 0.9, opacity: 0, y: 20 }}
//           transition={{ type: "spring", damping: 25 }}
//           onClick={(e) => e.stopPropagation()}
//           className="rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden my-auto flex flex-col"
//         >
//           {/* Header - Fixed */}
//           <div className="relative bg-white/80 p-4 sm:p-6 text-black flex-shrink-0">
//             <button
//               onClick={closeModal}
//               className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/20 rounded-full transition"
//             >
//               <X className="w-5 h-5" />
//             </button>
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: "spring" }}
//               className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
//             >
//               <User className="w-6 h-6 sm:w-8 sm:h-8" />
//             </motion.div>
//             <h2 className="text-xl sm:text-2xl font-bold text-center">
//               {mode === "login"
//                 ? "Welcome Back"
//                 : mode === "register"
//                 ? "Create Account"
//                 : "Reset Password"}
//             </h2>
//             <p className="text-center text-xs sm:text-sm opacity-90 mt-1">
//               {mode === "login"
//                 ? "Sign in to continue"
//                 : mode === "register"
//                 ? "Join Kankana Silks"
//                 : "We'll send you a reset link"}
//             </p>
//           </div>

//           {/* Form - Scrollable */}
//           <div className="bg-white p-4 sm:p-4 sm:py-6 overflow-y-auto flex-1">
//             {apiError && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
//               >
//                 <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
//                 <p className="text-sm text-red-700">{apiError}</p>
//               </motion.div>
//             )}

//             <AnimatePresence mode="wait">
//               {/* Login Form */}
//               {mode === "login" && (
//                 <motion.form
//                   key="login"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   className="space-y-4"
//                   onSubmit={handleLoginSubmit}
//                 >
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Email
//                     </label>
//                     <div className="relative">
//                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                       <input
//                         type="text"
//                         placeholder="name@example.com"
//                         className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-none outline outline-gray-300 rounded-xl  focus:outline-black transition text-sm sm:text-base ${
//                           loginErrors.email
//                             ? "outline-red-500"
//                             : "outline-gray-300"
//                         }`}
//                         onChange={(e) =>
//                           setLoginData({ ...loginData, email: e.target.value })
//                         }
//                         value={loginData.email}
//                         disabled={isLoading}
//                       />
//                     </div>
//                     {loginErrors.email && (
//                       <p className="mt-1 text-xs text-red-500">
//                         {loginErrors.email}
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Password
//                     </label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                       <input
//                         type={showPassword ? "text" : "password"}
//                         placeholder="••••••••"
//                         className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-none outline outline-gray-300 rounded-xl  focus:outline-black transition text-sm sm:text-base ${
//                           loginErrors.password
//                             ? "outline-red-500"
//                             : "outline-gray-300"
//                         }`}
//                         onChange={(e) =>
//                           setLoginData({
//                             ...loginData,
//                             password: e.target.value,
//                           })
//                         }
//                         value={loginData.password}
//                         disabled={isLoading}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                       >
//                         {showPassword ? (
//                           <EyeOff className="w-5 h-5" />
//                         ) : (
//                           <Eye className="w-5 h-5" />
//                         )}
//                       </button>
//                     </div>
//                     {loginErrors.password && (
//                       <p className="mt-1 text-xs text-red-500">
//                         {loginErrors.password}
//                       </p>
//                     )}
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <label className="flex items-center gap-2 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         className="w-4 h-4 accent-gray-600 rounded"
//                       />
//                       <span className="text-xs sm:text-sm text-gray-600">
//                         Remember me
//                       </span>
//                     </label>
//                     <button
//                       type="button"
//                       onClick={() => setMode("forgot")}
//                       className="text-xs sm:text-sm text-black hover:text-black/50 font-medium"
//                     >
//                       Forgot?
//                     </button>
//                   </div>

//                   <motion.button
//                     type="submit"
//                     whileHover={{ scale: isLoading ? 1 : 1.02 }}
//                     whileTap={{ scale: isLoading ? 1 : 0.98 }}
//                     disabled={isLoading}
//                     className="w-full bg-black text-white py-2.5 sm:py-3 rounded-full font-semibold shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {isLoading ? "Signing in..." : "Sign In"}
//                   </motion.button>

//                   <p className="text-center text-xs sm:text-sm text-gray-600">
//                     Don't have an account?{" "}
//                     <button
//                       type="button"
//                       onClick={() => setMode("register")}
//                       className="text-black hover:text-black/50 font-medium"
//                     >
//                       Sign up
//                     </button>
//                   </p>
//                 </motion.form>
//               )}

//               {/* Register Form */}
//               {mode === "register" && (
//                 <motion.form
//                   key="register"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   className="space-y-4"
//                   onSubmit={handleRegisterSubmit}
//                 >
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         First Name
//                       </label>
//                       <div className="relative">
//                         <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                         <input
//                           type="text"
//                           placeholder="Aisha"
//                           className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-none outline outline-gray-500 rounded-xl  focus:outline-black transition text-sm sm:text-base ${
//                             registerErrors.firstName
//                               ? "outline-red-500"
//                               : "outline-gray-500"
//                           }`}
//                           onChange={(e) =>
//                             setRegisterData({
//                               ...registerData,
//                               firstName: e.target.value,
//                             })
//                           }
//                           value={registerData.firstName}
//                           disabled={isLoading}
//                         />
//                       </div>
//                       {registerErrors.firstName && (
//                         <p className="mt-1 text-xs text-red-500">
//                           {registerErrors.firstName}
//                         </p>
//                       )}
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Last Name
//                       </label>
//                       <div className="relative">
//                         <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                         <input
//                           type="text"
//                           placeholder="Kapoor"
//                           className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-none outline outline-gray-500 rounded-xl  focus:outline-black transition text-sm sm:text-base ${
//                             registerErrors.lastName
//                               ? "outline-red-500"
//                               : "outline-gray-500"
//                           }`}
//                           onChange={(e) =>
//                             setRegisterData({
//                               ...registerData,
//                               lastName: e.target.value,
//                             })
//                           }
//                           value={registerData.lastName}
//                           disabled={isLoading}
//                         />
//                       </div>
//                       {registerErrors.lastName && (
//                         <p className="mt-1 text-xs text-red-500">
//                           {registerErrors.lastName}
//                         </p>
//                       )}
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Phone
//                       </label>
//                       <div className="relative">
//                         <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                         <input
//                           type="text"
//                           placeholder="9876543210"
//                           className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-none outline outline-gray-500 rounded-xl  focus:outline-black transition text-sm sm:text-base ${
//                             registerErrors.phone
//                               ? "outline-red-500"
//                               : "outline-gray-500"
//                           }`}
//                           onChange={(e) =>
//                             setRegisterData({
//                               ...registerData,
//                               phone: e.target.value,
//                             })
//                           }
//                           value={registerData.phone}
//                           disabled={isLoading}
//                         />
//                       </div>
//                       {registerErrors.phone && (
//                         <p className="mt-1 text-xs text-red-500">
//                           {registerErrors.phone}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Email
//                       </label>
//                       <div className="relative">
//                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                         <input
//                           type="email"
//                           placeholder="name@example.com"
//                           className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-none outline outline-gray-300 rounded-xl  focus:outline-black transition text-sm sm:text-base ${
//                             registerErrors.email
//                               ? "outline-red-500"
//                               : "outline-gray-300"
//                           }`}
//                           onChange={(e) =>
//                             setRegisterData({
//                               ...registerData,
//                               email: e.target.value,
//                             })
//                           }
//                           value={registerData.email}
//                           disabled={isLoading}
//                         />
//                       </div>
//                       {registerErrors.email && (
//                         <p className="mt-1 text-xs text-red-500">
//                           {registerErrors.email}
//                         </p>
//                       )}
//                     </div>

//                     <div className="col-span-2">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Password
//                       </label>
//                       <div className="relative">
//                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                         <input
//                           type={showPassword ? "text" : "password"}
//                           placeholder="••••••••"
//                           className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-none outline outline-gray-300 rounded-xl  focus:outline-black transition text-sm sm:text-base ${
//                             registerErrors.password
//                               ? "outline-red-500"
//                               : "outline-gray-300"
//                           }`}
//                           onChange={(e) =>
//                             setRegisterData({
//                               ...registerData,
//                               password: e.target.value,
//                             })
//                           }
//                           value={registerData.password}
//                           disabled={isLoading}
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowPassword(!showPassword)}
//                           className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                         >
//                           {showPassword ? (
//                             <EyeOff className="w-5 h-5" />
//                           ) : (
//                             <Eye className="w-5 h-5" />
//                           )}
//                         </button>
//                       </div>
//                       {registerErrors.password && (
//                         <p className="mt-1 text-xs text-red-500">
//                           {registerErrors.password}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                   <div>
//                     <label className="flex items-start gap-2 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         className={`w-full pl-10 pr-4 py-2.5 sm:py-3 outline-gray-300 rounded-xl  focus:outline-black transition text-sm sm:text-base ${
//                           registerErrors ? "outline-red-500" : ""
//                         }`}
//                         checked={registerData.termsAccepted}
//                         onChange={(e) =>
//                           setRegisterData({
//                             ...registerData,
//                             termsAccepted: e.target.checked,
//                           })
//                         }
//                         disabled={isLoading}
//                       />
//                       <span className="text-xs text-gray-600">
//                         I agree to the Terms of Service and Privacy Policy
//                       </span>
//                     </label>
//                     {registerErrors.termsAccepted && (
//                       <p className="mt-1 text-xs text-red-500">
//                         {registerErrors.termsAccepted}
//                       </p>
//                     )}
//                   </div>
//                   <motion.button
//                     type="submit"
//                     whileHover={{ scale: isLoading ? 1 : 1.02 }}
//                     whileTap={{ scale: isLoading ? 1 : 0.98 }}
//                     disabled={isLoading}
//                     className="w-full bg-black text-white py-2.5 sm:py-3 rounded-full font-semibold shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {isLoading ? "Creating Account..." : "Create Account"}
//                   </motion.button>

//                   <p className="text-center text-xs sm:text-sm text-gray-600">
//                     Already have an account?{" "}
//                     <button
//                       type="button"
//                       onClick={() => setMode("login")}
//                       className="text-black hover:text-black/50 font-medium"
//                     >
//                       Sign in
//                     </button>
//                   </p>
//                 </motion.form>
//               )}

//               {/* Forgot Password Form */}
//               {mode === "forgot" && (
//                 <motion.form
//                   key="forgot"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   className="space-y-4"
//                   onSubmit={handleForgotSubmit}
//                 >
//                   <p className="text-xs sm:text-sm text-gray-600 text-center mb-4">
//                     Enter your email and we'll send you a link to reset your
//                     password
//                   </p>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Email Address
//                     </label>
//                     <div className="relative">
//                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                       <input
//                         type="email"
//                         placeholder="name@example.com"
//                         className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border-none outline outline-gray-500 rounded-xl  focus:outline-black transition text-sm sm:text-base ${
//                           forgotErrors.email
//                             ? "outline-red-500"
//                             : "outline-gray-500"
//                         }`}
//                         onChange={(e) =>
//                           setForgotData({ email: e.target.value })
//                         }
//                         value={forgotData.email}
//                         disabled={isLoading}
//                       />
//                     </div>
//                     {forgotErrors.email && (
//                       <p className="mt-1 text-xs text-red-500">
//                         {forgotErrors.email}
//                       </p>
//                     )}
//                   </div>

//                   <motion.button
//                     type="submit"
//                     whileHover={{ scale: isLoading ? 1 : 1.02 }}
//                     whileTap={{ scale: isLoading ? 1 : 0.98 }}
//                     disabled={isLoading}
//                     className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-white py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {isLoading ? "Sending..." : "Send Reset Link"}
//                   </motion.button>

//                   <button
//                     type="button"
//                     onClick={() => setMode("login")}
//                     className="w-full text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium"
//                   >
//                     ← Back to Sign In
//                   </button>
//                 </motion.form>
//               )}
//             </AnimatePresence>

//             {mode !== "forgot" && (
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2 }}
//                 className="mt-6"
//               >
//                 <div className="relative">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-gray-300" />
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }
"use client"
import { type FormEvent, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Mail, Lock, Eye, EyeOff, Phone, AlertCircle } from "lucide-react"
import { useAuthModal } from "@/store/useAuthModalStore"
import { z } from "zod"
import { authService } from "@/lib/api/api.base.service"

// Zod Schemas
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password is too long"),
})

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
})

export type RegisterDTO = z.infer<typeof RegisterDTOSchema>

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

type LoginFormData = z.infer<typeof loginSchema>
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function AuthModal() {
  const { isOpen, mode, closeModal, setMode, setAuth } = useAuthModal()
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [registerData, setRegisterData] = useState<RegisterDTO>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    termsAccepted: false,
  })
  const [forgotData, setForgotData] = useState<ForgotPasswordFormData>({
    email: "",
  })

  // Error states
  const [loginErrors, setLoginErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})
  const [registerErrors, setRegisterErrors] = useState<Partial<Record<keyof RegisterDTO, string>>>({})
  const [forgotErrors, setForgotErrors] = useState<Partial<Record<keyof ForgotPasswordFormData, string>>>({})
  const [apiError, setApiError] = useState<string>("")

  // Reset form when mode changes
  useEffect(() => {
    setLoginErrors({})
    setRegisterErrors({})
    setForgotErrors({})
    setApiError("")
  }, [mode])

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoginErrors({})
    setApiError("")

    try {
      const validatedData = loginSchema.parse(loginData)
      setIsLoading(true)

      const res = await authService.login({
        email: validatedData.email,
        password: validatedData.password,
      })

      if (res.data.data) {
        const { accessToken, refreshToken, user } = res.data.data
        setAuth(accessToken, user, refreshToken)
      }

      closeModal()
      console.log("Login successful", res)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof LoginFormData, string>> = {}
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof LoginFormData] = err.message
          }
        })
        setLoginErrors(errors)
      } else {
        setApiError("Invalid email or password. Please try again.")
        console.error("Login error:", error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setRegisterErrors({})
    setApiError("")

    try {
      const validatedData = RegisterDTOSchema.parse(registerData)
      setIsLoading(true)

      const res = await authService.register({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        password: validatedData.password,
        phone: validatedData.phone,
      })

      if (res.data.data) {
        const { accessToken, refreshToken, user } = res.data.data
        setAuth(accessToken, user, refreshToken)
      }

      closeModal()
      console.log("Registration successful - user logged in automatically", res)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof RegisterDTO, string>> = {}
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof RegisterDTO] = err.message
          }
        })
        setRegisterErrors(errors)
      } else {
        setApiError("Registration failed. Please try again.")
        console.error("Registration error:", error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setForgotErrors({})
    setApiError("")

    try {
      const validatedData = forgotPasswordSchema.parse(forgotData)
      setIsLoading(true)

      const res = await authService.forgotPassword({
        email: validatedData.email,
      })

      setApiError("")
      alert("Password reset link sent! Check your email.")
      setMode("login")
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof ForgotPasswordFormData, string>> = {}
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof ForgotPasswordFormData] = err.message
          }
        })
        setForgotErrors(errors)
      } else {
        setApiError("Failed to send reset link. Please try again.")
        console.error("Forgot password error:", error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted || !isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 z-50"
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
          <div className="relative bg-gradient-to-br from-gray-50 to-white px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4 text-black flex-shrink-0 border-b border-gray-100">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 hover:bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </motion.div>
            <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-center">
              {mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : "Reset Password"}
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
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs sm:text-sm text-red-700">{apiError}</p>
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
                  className="space-y-3 sm:space-y-4"
                  onSubmit={handleLoginSubmit}
                >
                  <div>
                    <label htmlFor="login-email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        id="login-email"
                        type="email"
                        placeholder="name@example.com"
                        className={`w-full pl-9 pr-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition text-sm sm:text-base ${
                          loginErrors.email ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                        }`}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        value={loginData.email}
                        disabled={isLoading}
                        aria-invalid={!!loginErrors.email}
                        aria-describedby={loginErrors.email ? "login-email-error" : undefined}
                      />
                    </div>
                    {loginErrors.email && (
                      <p id="login-email-error" className="mt-1 text-xs text-red-500">
                        {loginErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
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
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-10 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition text-sm sm:text-base ${
                          loginErrors.password ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                        }`}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        value={loginData.password}
                        disabled={isLoading}
                        aria-invalid={!!loginErrors.password}
                        aria-describedby={loginErrors.password ? "login-password-error" : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-black rounded p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p id="login-password-error" className="mt-1 text-xs text-red-500">
                        {loginErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-gray-700">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-black rounded focus:ring-2 focus:ring-black"
                        aria-label="Remember me"
                      />
                      <span className="text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-black hover:text-black/60 font-medium focus:outline-none focus:ring-2 focus:ring-black rounded px-1"
                    >
                      Forgot?
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    disabled={isLoading}
                    className="w-full bg-black text-white py-2 sm:py-2.5 rounded-lg font-semibold shadow-md text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </motion.button>

                  <p className="text-center text-xs sm:text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="text-black hover:text-black/60 font-medium focus:outline-none focus:ring-2 focus:ring-black rounded px-1"
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
                            registerErrors.firstName ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
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
                          aria-describedby={registerErrors.firstName ? "register-firstname-error" : undefined}
                        />
                      </div>
                      {registerErrors.firstName && (
                        <p id="register-firstname-error" className="mt-1 text-xs text-red-500">
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
                            registerErrors.lastName ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
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
                          aria-describedby={registerErrors.lastName ? "register-lastname-error" : undefined}
                        />
                      </div>
                      {registerErrors.lastName && (
                        <p id="register-lastname-error" className="mt-1 text-xs text-red-500">
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
                          registerErrors.phone ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
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
                        aria-describedby={registerErrors.phone ? "register-phone-error" : undefined}
                      />
                    </div>
                    {registerErrors.phone && (
                      <p id="register-phone-error" className="mt-1 text-xs text-red-500">
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
                          registerErrors.email ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
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
                        aria-describedby={registerErrors.email ? "register-email-error" : undefined}
                      />
                    </div>
                    {registerErrors.email && (
                      <p id="register-email-error" className="mt-1 text-xs text-red-500">
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
                          registerErrors.password ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
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
                        aria-describedby={registerErrors.password ? "register-password-error" : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-black rounded p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {registerErrors.password && (
                      <p id="register-password-error" className="mt-1 text-xs text-red-500">
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
                        aria-describedby={registerErrors.termsAccepted ? "register-terms-error" : undefined}
                      />
                      <span className="text-xs text-gray-600 leading-tight">
                        I agree to the Terms of Service and Privacy Policy
                      </span>
                    </label>
                    {registerErrors.termsAccepted && (
                      <p id="register-terms-error" className="mt-1 text-xs text-red-500">
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
                    Enter your email and we'll send you a link to reset your password
                  </p>

                  <div>
                    <label htmlFor="forgot-email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
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
                          forgotErrors.email ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                        }`}
                        onChange={(e) => setForgotData({ email: e.target.value })}
                        value={forgotData.email}
                        disabled={isLoading}
                        aria-invalid={!!forgotErrors.email}
                        aria-describedby={forgotErrors.email ? "forgot-email-error" : undefined}
                      />
                    </div>
                    {forgotErrors.email && (
                      <p id="forgot-email-error" className="mt-1 text-xs text-red-500">
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
  )
}

