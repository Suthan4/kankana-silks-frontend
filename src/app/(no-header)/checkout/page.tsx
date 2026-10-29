import CheckoutClient from "@/components/checkOutClient";
import CheckoutLoadingState from "@/components/checkoutLoadingState";
import { Suspense } from "react";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoadingState />}>
      <CheckoutClient />
    </Suspense>
  );
}
