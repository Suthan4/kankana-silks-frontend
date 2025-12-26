export const revalidate = 60;


import LandingPageClient from "./landingPage.client";
import HeroSection from "./sections/hero-section";
import RealCollection from "./sections/real-collection";

export default function LandingPage() {
  return (
    <>
      {/* LCP-safe */}
      <HeroSection />
      <RealCollection />

      {/* Lazy-loaded CSR */}
      <LandingPageClient />

    </>
  );
}
