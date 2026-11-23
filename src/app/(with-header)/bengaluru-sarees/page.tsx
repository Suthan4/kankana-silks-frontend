import type { Metadata } from "next";
import CityLandingPage, { type CitySeoConfig } from "@/components/seo/cityLandingPage";
import { seoPageDescription } from "@/lib/seo/metadata";

const config: CitySeoConfig = {
  city: "Bengaluru",
  slug: "bengaluru-sarees",
  alternateCityName: "Bangalore",
  title: "Premium Sarees in Bengaluru",
  description: "Shop premium silk, Kanchipuram, Banarasi, Paithani and wedding sarees online from Bengaluru or Bangalore with Kankana Silks.",
  heading: "Shop premium sarees online in Bengaluru",
  intro: "Discover traditional and occasion-ready sarees from Kankana Silks, a Mysore-based saree store serving online shoppers in Bengaluru. Explore available Kanchipuram, Banarasi, Paithani, Mysore silk and handloom collections for weddings, festivals and celebrations.",
  sections: [
    { heading: "Premium silk sarees for Bengaluru shoppers", body: "Explore sarees across traditional weaves, colours and occasion styles. Browse product photographs, descriptions and available details before choosing a saree for a wedding, festive event or special occasion." },
    { heading: "Kanchipuram, Banarasi and Paithani collections", body: "Looking for Kanchipuram sarees in Bengaluru, Banarasi sarees in Bangalore or Paithani styles? Visit the online collection to see currently available designs and product-specific details." },
    { heading: "Bridal and wedding saree shopping online", body: "Shortlist bridal and wedding sarees from home, compare the product details and contact Kankana Silks for help with availability. Delivery options and serviceability are confirmed for the delivery address during checkout." },
    { heading: "Bengaluru and Bangalore", body: "This page is intended for shoppers searching both Bengaluru and Bangalore. Kankana Silks operates its listed store in Mysore; this page is for online collection discovery and delivery enquiries, not a Bengaluru store address." },
  ],
};

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  keywords: [
    "premium sarees in Bengaluru",
    "premium sarees in Bangalore",
    "premium silk sarees Bengaluru",
    "silk saree online shopping Bangalore",
    "Kanchipuram sarees in Bengaluru",
    "Kanjivaram sarees Bangalore",
    "Banarasi sarees Bengaluru",
    "Paithani sarees Bangalore",
    "Mysore silk sarees Bengaluru",
    "bridal sarees Bangalore",
    "wedding sarees Bengaluru",
    "designer sarees Bangalore",
    "online saree shopping Bengaluru",
  ],
  alternates: { canonical: "/bengaluru-sarees" },
  openGraph: {
    title: `${config.title} | Kankana Silks`,
    description: seoPageDescription(config.description, config.description),
    url: "https://www.kankanasilks.com/bengaluru-sarees",
    siteName: "Kankana Silks",
    locale: "en_IN",
    type: "website",
  },
};

export default function BengaluruSareesPage() {
  return <CityLandingPage config={config} />;
}
