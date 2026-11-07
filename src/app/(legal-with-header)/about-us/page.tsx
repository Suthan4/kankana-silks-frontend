import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Kankana Silks in Mysore",
  description: "Learn about Kankana Silks, a Mysore-based saree store celebrating Indian textile heritage with curated Kanchipuram, Banarasi, Paithani and handloom sarees.",
  alternates: { canonical: "/about-us" },
  robots: { index: true, follow: true },
};

import AboutUs from "@/components/legal/aboutUs";

export default function Aboutuspage() {
  return <AboutUs />;
}
