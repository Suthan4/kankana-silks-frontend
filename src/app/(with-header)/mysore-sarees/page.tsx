import type { Metadata } from "next";
import CityLandingPage, { type CitySeoConfig } from "@/components/seo/cityLandingPage";

const config: CitySeoConfig = {
  city: "Mysore",
  slug: "mysore-sarees",
  alternateCityName: "Mysuru",
  title: "Premium Sarees in Mysore | Kankana Silks",
  description: "Explore premium silk, Kanchipuram, Banarasi, Paithani and bridal sarees at Kankana Silks in Mysore. Browse online or visit our Vijayanagar store.",
  heading: "Discover premium sarees in Mysore",
  intro: "Explore a considered collection of traditional Indian sarees at Kankana Silks, a Mysore-based saree store. Browse Kanchipuram silk, Banarasi, Paithani, Mysore silk and handloom styles for weddings, festive occasions and meaningful celebrations. Customers may also search for Mysuru saree collections.",
  isStoreCity: true,
  sections: [
    { heading: "Silk and traditional saree collections in Mysore", body: "Find sarees for wedding functions, festivals, family celebrations and gifting. Explore the available Kanchipuram, Banarasi, Paithani, Mysore silk and handloom collections, with product details shown on each listing." },
    { heading: "Bridal and wedding sarees", body: "Planning bridal or wedding shopping in Mysore? Browse occasion-led saree styles and compare colours, designs and product details online. Contact Kankana Silks if you need help checking a particular design or its availability." },
    { heading: "Shop online or visit our Mysore store", body: "Browse the collection online at your convenience or visit the Kankana Silks store in Vijayanagar, Mysore. Please contact the team for current store timings and product availability before travelling." },
    { heading: "Mysore and Mysuru searches", body: "Whether you search for premium sarees in Mysore, silk sarees in Mysuru or a saree shop in Vijayanagar, this page brings together the Kankana Silks store information and online collection." },
  ],
};

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  keywords: [
    "premium sarees in Mysore",
    "premium silk sarees Mysore",
    "saree shop in Mysore",
    "silk sarees in Mysuru",
    "Mysuru saree collection",
    "Kanchipuram sarees in Mysore",
    "Banarasi sarees in Mysore",
    "Paithani sarees Mysore",
    "bridal sarees Mysore",
    "wedding sarees Mysore",
    "Mysore silk sarees",
    "saree shop Vijayanagar Mysore",
  ],
  alternates: { canonical: "/mysore-sarees" },
  openGraph: {
    title: config.title,
    description: config.description,
    url: "https://www.kankanasilks.com/mysore-sarees",
    siteName: "Kankana Silks",
    locale: "en_IN",
    type: "website",
  },
};

export default function MysoreSareesPage() {
  return <CityLandingPage config={config} />;
}
