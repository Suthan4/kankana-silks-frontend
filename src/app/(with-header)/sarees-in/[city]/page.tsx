import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CityLandingPage, { type CitySeoConfig } from "@/components/seo/cityLandingPage";
import { citySeoEntries } from "@/config/seo/cities";
import { seoPageDescription } from "@/lib/seo/metadata";

type Props = { params: Promise<{ city: string }> };

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return citySeoEntries.map(({ slug }) => ({ city: slug }));
}

function getCity(citySlug: string) {
  return citySeoEntries.find((entry) => entry.slug === citySlug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const entry = getCity(city);

  if (!entry) {
    return {
      title: "City Not Found | Kankana Silks",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `/sarees-in/${entry.slug}`;
  const pageTitle = `Silk Sarees in ${entry.city}`;
  return {
    title: pageTitle,
    description: seoPageDescription(entry.description, entry.description),
    keywords: [
      `sarees in ${entry.city}`,
      `silk sarees in ${entry.city}`,
      `wedding sarees in ${entry.city}`,
      `traditional sarees in ${entry.city}`,
      `buy sarees online ${entry.city}`,
    ],
    alternates: { canonical },
    openGraph: {
      title: pageTitle + " | Kankana Silks",
      description: seoPageDescription(entry.description, entry.description),
      url: `https://www.kankanasilks.com${canonical}`,
      siteName: "Kankana Silks",
      locale: "en_IN",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function CitySareesPage({ params }: Props) {
  const { city } = await params;
  const entry = getCity(city);
  if (!entry) notFound();

  const config: CitySeoConfig = {
    city: entry.city,
    slug: `sarees-in/${entry.slug}`,
    title: `Silk Sarees in ${entry.city}`,
    description: entry.description,
    heading: entry.heading,
    intro: entry.intro,
    sections: [
      {
        heading: `Explore saree collections in ${entry.city}`,
        body: `Browse the live Kankana Silks category collection for traditional, silk and occasion sarees. Each category links to the same current collection available throughout the store; product-level availability is shown on the listing.`,
      },
      {
        heading: `Online saree shopping for ${entry.city}`,
        body: `Kankana Silks is based in Mysore. You can explore the online collection from ${entry.city}; enter your delivery address during checkout to confirm serviceability, delivery options and applicable charges.`,
      },
    ],
  };

  return <CityLandingPage config={config} />;
}
