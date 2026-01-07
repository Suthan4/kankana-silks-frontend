import Collection from "./sections/collections";
import CTASection from "./sections/cta-section";
import HeroSection from "./sections/hero-section";
import HorizontalShowcase from "./sections/HorizontalShowcase";
import PremiumCollectionCarousel from "./sections/premium-collection";
import RealCollection from "./sections/real-collection";
import SquareCollectionsCarousel from "./sections/squareCollectionCarousel";
import VerticalParallaxHero from "./sections/verticalParallaxScroll";

export default function LandingPage() {
  return (
    <>
      {/* LCP-safe */}
      <HeroSection />
      <RealCollection />

      {/* Lazy-loaded CSR */}
      <HorizontalShowcase />
      <PremiumCollectionCarousel />
      <VerticalParallaxHero />
      <SquareCollectionsCarousel />
      <Collection />
      <CTASection />
    </>
  );
}
