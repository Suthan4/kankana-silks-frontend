"use client";

import dynamic from "next/dynamic";

const HorizontalShowcase = dynamic(
    () => import("./sections/HorizontalShowcase"),
    { ssr: false }
);

const PremiumCollectionCarousel = dynamic(
    () => import("./sections/premium-collection"),
    { ssr: false }
);

const VerticalParallaxHero = dynamic(
    () => import("./sections/verticalParallaxScroll"),
    { ssr: false }
);

const SquareCollectionsCarousel = dynamic(
    () => import("./sections/squareCollectionCarousel"),
    { ssr: false }
);

const Collection = dynamic(() => import("./sections/collections"), {
    ssr: false,
});
const CTASection = dynamic(() => import("./sections/cta-section"), {
  ssr: false,
});

export default function LandingPageClient() {
  return (
    <>
      <HorizontalShowcase />
      <PremiumCollectionCarousel />
      <VerticalParallaxHero />
      <SquareCollectionsCarousel />
      <Collection />
      <CTASection />
    </>
  );
}
