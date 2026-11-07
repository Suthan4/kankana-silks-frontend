import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Kankana Silks Mysore",
  description: "Contact Kankana Silks for saree orders, product questions and support. Visit our store at 464, First Floor, Jayachamarajendra Road, Vijayanagar, Mysore or email support@kankanasilks.com.",
  alternates: { canonical: "/contact-us" },
  robots: { index: true, follow: true },
};

import ContactUs from "@/components/legal/contactUs";

export default function Contactuspage() {
  return <ContactUs />;
}
