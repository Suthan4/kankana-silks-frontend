import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping and Delivery Policy in India",
  description: "Read about Kankana Silks shipping, dispatch, delivery timelines and order tracking for customers across India.",
  alternates: { canonical: "/shipping-policy" },
  robots: { index: true, follow: true },
};

import ShippingPolicy from '@/components/legal/shippingPolicy'

export default function page() {
  return <ShippingPolicy/>
}
