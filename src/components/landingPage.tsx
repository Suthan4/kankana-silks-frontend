"use client";

import Collection from "./sections/collections";
import CollectionsSection from "./sections/collections-section";
import CTASection from "./sections/cta-section";
import FeaturedSection from "./sections/featured-section";
import Hero from "./sections/hero-section";
import HeroSection from "./sections/hero-section";
import HorizontalShowcase from "./sections/HorizontalShowcase";
import PremiumCollectionCarousel from "./sections/premium-collection";
import RealCollection from "./sections/real-collection";
import SquareCollectionsCarousel from "./sections/squareCollectionCarousel";
import VerticalParallaxHero from "./sections/verticalParallaxScroll";

function LandingPage() {
  return (
    <>
      <HeroSection />
      <RealCollection />
      <HorizontalShowcase />
      <PremiumCollectionCarousel />
      <VerticalParallaxHero />
      <SquareCollectionsCarousel />
      <Collection />
      <CTASection />
    </>
  );
}

export default LandingPage;
