import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return and Refund Policy",
  description: "Review the Kankana Silks return and refund policy, eligibility, return process and support information.",
  alternates: { canonical: "/return-policy" },
  robots: { index: true, follow: true },
};

import ReturnPolicy from "@/components/legal/returnPolicy";

export default function ReturnPolicypage() {
  return <ReturnPolicy />;
}
