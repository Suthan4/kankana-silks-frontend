import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Cancellation Policy",
  description: "Read the Kankana Silks order cancellation policy, including how to request a cancellation and get help with an existing order.",
  alternates: { canonical: "/cancellation-policy" },
  robots: { index: true, follow: true },
};

import CancellationPolicy from "@/components/legal/cancellationPolicy";

export default function CancellationPolicypage() {
  return <CancellationPolicy />;
}
