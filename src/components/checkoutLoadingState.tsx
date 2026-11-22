import { LoaderCircle, ShieldCheck, ShoppingBag } from "lucide-react";

export default function CheckoutLoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading secure checkout"
      className="min-h-[70vh] bg-[#faf9f6] px-4 py-12 flex items-center justify-center"
    >
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-950 text-white">
          <ShoppingBag className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-center text-xl font-semibold tracking-tight text-stone-950">
          Preparing your checkout
        </h1>
        <p className="mt-2 text-center text-sm leading-6 text-stone-500">
          We’re checking your items, delivery details, and order total.
        </p>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-stone-100">
          <div className="h-full w-2/3 rounded-full bg-stone-900 animate-pulse" />
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-stone-500">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading secure checkout…
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 border-t border-stone-100 pt-4 text-xs text-stone-400">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Your order is not placed until you confirm payment.
        </div>
      </div>
    </div>
  );
}
