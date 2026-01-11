"use client";

import { useEffect, useState } from "react";
import HeroSection from "./sections/hero-section";
import CTASection from "./sections/cta-section";
import homeSectionService, {
  HomeSection,
  SectionType,
} from "@/lib/api/home-section.api.service";

// Import all section components
import HeroSlider from "./sections/heroSlider";
import ProductGrid from "./sections/productGrid";
import ProductCarousel from "./sections/productCarousel";
import CategoryShowcase from "./sections/Categoryshowcase";
import MediaGridSection from "./sections/mediaGridSection";
import { useQuery } from "@tanstack/react-query";

export default function LandingPage() {
  const {
    data: sections = [],
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: ["home-sections-active"],
    queryFn: () => homeSectionService.getActiveSections(),
  });

  const getDisplayTitle = (section: HomeSection) => {
    if (section.type === SectionType.CUSTOM && section.customTypeName) {
      return section.customTypeName;
    }
    return section.title;
  };

  /**
   * SUPER SIMPLE: Just check what content exists and render it
   * NO type restrictions - just render based on data
   */
  const renderSection = (section: HomeSection, index: number) => {
    const hasProducts = section.products && section.products.length > 0;
    const hasCategories = section.categories && section.categories.length > 0;
    const hasMedia = section.media && section.media.length > 0;
    const displayTitle = getDisplayTitle(section);

    const sectionWithTitle = {
      ...section,
      title: displayTitle,
    };

    console.log(
      `✅ Rendering: ${section.type} | P:${hasProducts} C:${hasCategories} M:${hasMedia}`
    );

    // PRIORITY 1: Has Products? → Render Products
    if (hasProducts) {
      if (section.layout === "carousel") {
        console.log("   → ProductCarousel");
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
      console.log("   → ProductGrid");
      return <ProductGrid key={section.id} section={sectionWithTitle} />;
    }

    // PRIORITY 2: Has Categories? → Render Categories
    if (hasCategories) {
      console.log("   → CategoryShowcase");
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

    // PRIORITY 3: Has Media? → Render Media
    if (hasMedia) {
      // Use HeroSlider if layout is slider
      if (section.layout === "slider") {
        console.log("   → HeroSlider");
        return <HeroSlider key={section.id} section={sectionWithTitle} />;
      }
      console.log("   → MediaGridSection");
      return <MediaGridSection key={section.id} section={sectionWithTitle} />;
    }

    // PRIORITY 4: No content but has title/text? → Render text section
    console.log("   → Text Only Section");
    return (
      <section
        key={section.id}
        className="py-12 md:py-20 lg:py-24"
        style={{ backgroundColor: section.backgroundColor }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          {section.showTitle && section.title && (
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight"
              style={{ color: section.textColor }}
            >
              {displayTitle}
            </h2>
          )}
          {section.showSubtitle && section.subtitle && (
            <p
              className="text-base md:text-xl opacity-80 max-w-3xl mx-auto"
              style={{ color: section.textColor }}
            >
              {section.subtitle}
            </p>
          )}
          {section.description && (
            <p
              className="text-sm md:text-base opacity-60 max-w-2xl mx-auto mt-4"
              style={{ color: section.textColor }}
            >
              {section.description}
            </p>
          )}
          {section.ctaButtons && section.ctaButtons.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              {section.ctaButtons.map((btn) => (
                <a
                  key={btn.id}
                  href={btn.url}
                  target={btn.openNewTab ? "_blank" : "_self"}
                  rel={btn.openNewTab ? "noopener noreferrer" : ""}
                  className={`
                    px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 inline-flex items-center gap-3
                    ${
                      btn.style === "PRIMARY"
                        ? "bg-black text-white hover:bg-gray-800"
                        : btn.style === "SECONDARY"
                        ? "bg-gray-200 text-black hover:bg-gray-300"
                        : "border-2 hover:bg-current hover:text-white"
                    }
                  `}
                  style={{
                    borderColor:
                      btn.style === "OUTLINE" ? section.textColor : undefined,
                    color:
                      btn.style === "OUTLINE" ? section.textColor : undefined,
                  }}
                >
                  {btn.text}
                  {btn.icon && <span>{btn.icon}</span>}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

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
      <HeroSection />

      {/* Render ALL sections - just check what data exists */}
      {sections.map((section, index) => renderSection(section, index))}

      <CTASection />
    </main>
  );
}
