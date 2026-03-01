"use client";

import OrderSuccessContent from "@/components/orderSuccessContent";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
