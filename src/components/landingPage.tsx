"use client";

import { useEffect, useState } from "react";
import HeroSection from "./sections/hero-section";
import CTASection from "./sections/cta-section";
import homeSectionService, {
  HomeSection,
  SectionType,
} from "@/lib/api/home-section.api";

// Import all section components
import HeroSlider from "./sections/heroSlider";
import ProductGrid from "./sections/productGrid";
import ProductCarousel from "./sections/productCarousel";
import CategoryShowcase from "./sections/Categoryshowcase";
import MediaGridSection from "./sections/mediaGridSection";
import { useQuery } from "@tanstack/react-query";
import AestheticFullImage from "./sections/aestheticFullImage";
import BannerSection from "./sections/bannerSection";
import bannerService, { Banner } from "@/lib/api/banner.api";

export default function LandingPage({
  initialSections,
  initialBanners,
}: {
  /** Server-fetched sections so the first HTML already contains the content. */
  initialSections?: HomeSection[];
  /** Server-fetched banners so the hero is in the first HTML. */
  initialBanners?: Banner[];
}) {
  const {
    data: sections = [],
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: ["home-sections-active"],
    queryFn: () => homeSectionService.getActiveSections(),
    initialData: initialSections,
  });
  const {
    data: banners_data = [],
    isLoading: isBannerLoading,
    isError: isBannerError,
  } = useQuery<Banner[]>({
    queryKey: ["active-banners"],
    queryFn: () => bannerService.getActiveBanners(),
    initialData: initialBanners,
  });

  const getDisplayTitle = (section: HomeSection) => {
    if (section.type === SectionType.CUSTOM && section.customTypeName) {
      return section.customTypeName;
    }
    return section.title;
  };

  /**
   * Render section based on layout and data
   */
  const renderSection = (section: HomeSection, index: number) => {
    const layout = section.layout?.trim().toLowerCase();
    const displayTitle = getDisplayTitle(section);

    const sectionWithTitle = {
      ...section,
      title: displayTitle,
    };

    // ✅ HARD OVERRIDE — aesthetic always wins
    if (layout === "aesthetic-fullscreen") {
      return (
        <AestheticFullImage
          key={`aesthetic-${section.id}`}
          section={sectionWithTitle}
          // First thing on the page (no top banner above it) => LCP element.
          priority={index === 0 && banners_data.length === 0}
        />
      );
    }

    // ✅ Banner Hero Section Carousel
    if (layout === "banner") {
      return (
        <BannerSection
          key={`banner-${section.id}`}
          section={sectionWithTitle}
        />
      );
    }

    const hasProducts = section.products && section.products.length > 0;
    const hasCategories = section.categories && section.categories.length > 0;
    const hasMedia = section.media && section.media.length > 0;

    // Slider / Hero Slider
    if (layout === "slider" || section.type === SectionType.HERO_SLIDER) {
      if (hasMedia) {
        return <HeroSlider key={section.id} section={sectionWithTitle} />;
      }
      if (hasProducts) {
        return <BannerSection key={section.id} section={sectionWithTitle} />;
      }
    }

    // Products
    if (hasProducts) {
      if (layout === "carousel") {
        return (
          <ProductCarousel
            key={section.id}
            title={displayTitle}
            subtitle={section.subtitle}
            products={section.products}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            showTitle={section.showTitle}
            showSubtitle={section.showSubtitle}
          />
        );
      }

      return <ProductGrid key={section.id} section={sectionWithTitle} />;
    }

    // Categories
    if (hasCategories) {
      return (
        <CategoryShowcase
          key={section.id}
          title={displayTitle}
          subtitle={section.subtitle}
          categories={section.categories}
          backgroundColor={section.backgroundColor}
          textColor={section.textColor}
          showTitle={section.showTitle}
          showSubtitle={section.showSubtitle}
          columns={section.columns}
        />
      );
    }

    // Media
    if (hasMedia) {
      return <MediaGridSection key={section.id} section={sectionWithTitle} />;
    }

    // Text fallback
    return (
      <section key={section.id} className="py-12 text-center">
        <h2>{displayTitle}</h2>
      </section>
    );
  };

  const orderedSections = [...sections].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">
            Loading amazing content...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Oops!</h2>
          <p className="text-gray-600">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {banners_data?.length > 0 && (
        <HeroSection
          banners={banners_data}
          isLoading={isBannerLoading}
          isError={isBannerError}
          error={error}
        />
      )}

      {/* Only render the wrapper (and its padding) when there's something to show */}
      {orderedSections.length > 0 && (
        <section className="">
          {orderedSections.map((section, index) =>
            renderSection(section, index),
          )}{" "}
        </section>
      )}

      <CTASection />
    </main>
  );
}
