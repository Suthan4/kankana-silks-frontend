import type { Metadata } from "next";
import CityLandingPage, { type CitySeoConfig } from "@/components/seo/cityLandingPage";
import { seoPageDescription } from "@/lib/seo/metadata";

const config: CitySeoConfig = {
  city: "Hyderabad",
  slug: "hyderabad-sarees",
  title: "Silk Sarees in Hyderabad",
  description: "Discover premium silk, Kanchipuram, Banarasi, Paithani and bridal sarees online in Hyderabad from Kankana Silks. Check delivery availability at checkout.",
  heading: "Discover premium traditional sarees in Hyderabad",
  intro: "Explore the Kankana Silks online saree collection from Hyderabad. Browse available Kanchipuram, Banarasi, Paithani, Mysore silk and handloom styles for weddings, festive occasions and celebrations, with detailed product information to help you choose.",
  sections: [
    { heading: "Premium silk and traditional sarees", body: "Compare saree designs for weddings, festivals, family occasions and gifting. Product pages provide the latest available photographs and descriptions; refer to those details for the specific saree you are considering." },
    { heading: "Kanchipuram, Banarasi and Paithani sarees", body: "Find currently listed Kanchipuram silk sarees in Hyderabad searches, along with Banarasi, Paithani and other traditional styles. Browse the live collection to see which designs are available to order." },
    { heading: "Bridal and wedding saree collection", body: "Explore occasion-led sarees for bridal functions, receptions and wedding celebrations. Contact the Kankana Silks team if you need assistance with a product's details or availability." },
    { heading: "Online shopping and delivery to Hyderabad", body: "Kankana Silks operates its listed store in Mysore and offers online shopping. Confirm delivery serviceability, options and applicable charges for your Hyderabad address during checkout." },
  ],
};

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  keywords: [
    "premium sarees in Hyderabad",
    "pure silk sarees Hyderabad",
    "Kanchipuram silk sarees Hyderabad",
    "Kanjivaram sarees Hyderabad",
    "Banarasi sarees Hyderabad",
    "Paithani sarees Hyderabad",
    "Mysore silk sarees Hyderabad",
    "bridal sarees Hyderabad",
    "wedding silk sarees Hyderabad",
    "traditional sarees Hyderabad",
    "handloom sarees Hyderabad",
    "online saree shopping Hyderabad",
  ],
  alternates: { canonical: "/hyderabad-sarees" },
  openGraph: {
    title: `${config.title} | Kankana Silks`,
    description: seoPageDescription(config.description, config.description),
    url: "https://www.kankanasilks.com/hyderabad-sarees",
    siteName: "Kankana Silks",
    locale: "en_IN",
    type: "website",
  },
};

export default function HyderabadSareesPage() {
  return <CityLandingPage config={config} />;
}
