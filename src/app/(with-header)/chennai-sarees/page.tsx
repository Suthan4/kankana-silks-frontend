import type { Metadata } from "next";
import CityLandingPage, { type CitySeoConfig } from "@/components/seo/cityLandingPage";

const config: CitySeoConfig = {
  city: "Chennai",
  slug: "chennai-sarees",
  title: "Silk Sarees Online in Chennai | Kankana Silks",
  description: "Explore Kanchipuram, Banarasi, Paithani and traditional silk sarees online in Chennai with Kankana Silks. Check product details and delivery availability.",
  heading: "Explore traditional silk sarees online in Chennai",
  intro: "Browse the Kankana Silks online collection from Chennai and discover traditional Indian sarees for weddings, festive occasions and celebrations. Explore available Kanchipuram, Banarasi, Paithani, Mysore silk and handloom styles, with product-specific information available on each listing.",
  sections: [
    { heading: "Kanchipuram and traditional silk sarees", body: "Searching for Kanchipuram silk sarees in Chennai or traditional wedding sarees? Browse the current collection and review each product's description, photographs and available material information before ordering." },
    { heading: "Banarasi, Paithani and handloom styles", body: "Explore different saree traditions in one online collection, including available Banarasi, Paithani and handloom designs. Stock and individual designs may change, so refer to live product listings for current availability." },
    { heading: "Wedding and bridal saree shopping online", body: "Shortlist sarees for bridal events, receptions, festivals and family functions from home. If you need help with a product, contact Kankana Silks before placing your order." },
    { heading: "Delivery enquiries for Chennai", body: "Kankana Silks is based in Mysore and serves online shoppers. Enter your Chennai delivery address at checkout to confirm current serviceability, delivery options and applicable charges." },
  ],
};

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  keywords: [
    "premium sarees in Chennai",
    "silk sarees online Chennai",
    "Kanchipuram silk sarees Chennai",
    "Kanjivaram sarees in Chennai",
    "Banarasi sarees Chennai",
    "Paithani sarees Chennai",
    "Mysore silk sarees Chennai",
    "bridal silk sarees Chennai",
    "wedding sarees online Chennai",
    "traditional sarees Chennai",
    "handloom sarees Chennai",
    "buy premium sarees online Chennai",
  ],
  alternates: { canonical: "/chennai-sarees" },
  openGraph: {
    title: config.title,
    description: config.description,
    url: "https://www.kankanasilks.com/chennai-sarees",
    siteName: "Kankana Silks",
    locale: "en_IN",
    type: "website",
  },
};

export default function ChennaiSareesPage() {
  return <CityLandingPage config={config} />;
}
