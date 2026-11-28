"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertCircle, ArrowLeft, Mail, X } from "lucide-react";
import { useAuthModal } from "@/store/useAuthModalStore";
import { authService } from "@/lib/api/api.base.service";
import { useQueryClient } from "@tanstack/react-query";

export default function AuthModal() {
  const { isOpen, closeModal, setAuth } = useAuthModal();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOpen) {
      setStep("email");
      setOtp("");
      setError("");
      setMessage("");
      setIsNewAccount(false);
      setTermsAccepted(false);
    }
  }, [isOpen]);

  const sendCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const response = await authService.sendEmailOtp(normalizedEmail);
      setIsNewAccount(Boolean(response.data?.data?.isNewAccount));
      setTermsAccepted(false);
      setEmail(normalizedEmail);
      setStep("otp");
      setMessage("We sent a 6-digit verification code to your email.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to send the code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setLoading(true);
    try {
      if (isNewAccount && !termsAccepted) {
        setError("Please accept the Terms of Service and Privacy Policy to create your account.");
        return;
      }
      const response = await authService.verifyEmailOtp(email, otp, isNewAccount ? termsAccepted : false);
      const data = response.data?.data;
      if (!data?.accessToken || !data?.user) throw new Error("Sign-in response was incomplete.");
      setAuth(data.accessToken, data.user, data.refreshToken);
      queryClient.clear();
      closeModal();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await authService.sendEmailOtp(email);
      setIsNewAccount(Boolean(response.data?.data?.isNewAccount));
      setMessage("A new verification code has been sent.");
      setOtp("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Please wait before requesting another code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        showCloseButton={false}
        aria-labelledby="auth-modal-title"
        className="auth-dialog-content w-[calc(100%-1.5rem)] max-w-sm max-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-xl"
        style={{ maxHeight: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 24px)" }}
      >
        <div className="relative px-5 pb-6 pt-5 sm:px-7 sm:pb-7">
          <button onClick={closeModal} className="absolute right-3 top-3 rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Close sign in">
            <X className="h-5 w-5" />
          </button>
          <div className="mb-5 flex justify-center">
            <img src="/image-removebg-preview.png" width={316} height={152} alt="Kankana Silks" className="h-10 w-auto object-contain" />
          </div>
          {step === "email" ? (
            <>
              <h2 id="auth-modal-title" className="text-center text-xl font-futura-bold text-gray-900">Sign in or create account</h2>
              <p className="mt-2 text-center text-sm text-gray-500">Enter your email and we’ll send you a verification code.</p>
              <form onSubmit={sendCode} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium text-gray-700">Email address</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input id="auth-email" type="email" autoComplete="email" autoFocus value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" disabled={loading} className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-base outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? "Sending code..." : "Continue"}
                </button>
              </form>
              <p className="mt-4 text-center text-xs text-gray-500">New to Kankana Silks? Your account will be created after email verification.</p>
            </>
          ) : (
            <>
              <button type="button" onClick={() => { setStep("email"); setOtp(""); setError(""); setMessage(""); }} className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black">
                <ArrowLeft className="h-4 w-4" /> Change email
              </button>
              <h2 id="auth-modal-title" className="text-center text-xl font-futura-bold text-gray-900">Verify your email</h2>
              <p className="mt-2 text-center text-sm text-gray-500">Enter the 6-digit code sent to <span className="font-medium text-gray-800">{email}</span>.</p>
              <form onSubmit={verifyCode} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="auth-otp" className="mb-1.5 block text-sm font-medium text-gray-700">Verification code</label>
                  <input id="auth-otp" type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" disabled={loading} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-2xl font-semibold tracking-[0.5em] outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10" />
                </div>
                {isNewAccount && (
                  <label className="flex cursor-pointer items-start gap-2 text-left text-xs leading-relaxed text-gray-600">
                    <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} disabled={loading} className="mt-0.5 h-4 w-4 shrink-0 accent-black" />
                    <span>
                      I agree to the{" "}
                      <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-black">Terms of Service</a>
                      {" "}and{" "}
                      <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-black">Privacy Policy</a>.
                    </span>
                  </label>
                )}
                <button type="submit" disabled={loading || otp.length !== 6 || (isNewAccount && !termsAccepted)} className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? "Verifying..." : "Verify and sign in"}
                </button>
                <button type="button" disabled={loading} onClick={resendCode} className="w-full py-2 text-sm font-medium text-gray-600 hover:text-black disabled:opacity-50">Resend code</button>
              </form>
            </>
          )}
          {(message || error) && (
            <div className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
              {error && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
              <p>{error || message}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
