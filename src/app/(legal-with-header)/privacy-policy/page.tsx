import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Kankana Silks handles customer information, website privacy, order details and personal data.",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
};

import PrivacyPolicy from "@/components/legal/privacyPolicy";

export default function PrivacyPolicypage() {
  return <PrivacyPolicy />;
}
