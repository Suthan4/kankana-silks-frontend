import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saree Shopping FAQs and Order Help",
  description: "Find answers about shopping at Kankana Silks, product details, payments, shipping, order tracking, returns and saree care.",
  alternates: { canonical: "/faq" },
  robots: { index: true, follow: true },
};

import FAQ from "@/components/legal/faq";

export default function Faqpage() {
  return <FAQ />;
}
