"use client";

import dynamic from "next/dynamic";
import HeroSection from "./sections/hero-section";
import CTASection from "./sections/cta-section";
import { ShieldCheck, RefreshCw, Video, ArrowRight } from "lucide-react";
import homeSectionService, {
  type HomeSection,
  SectionType,
} from "@/lib/api/home-section.api";

import { useQuery } from "@tanstack/react-query";
import type { Banner } from "@/lib/api/banner.api";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import VideoConsultationModal from "./video-consultationModal";

const HeroSlider = dynamic(() => import("./sections/heroSlider"));
const ProductGrid = dynamic(() => import("./sections/productGrid"));
const ProductCarousel = dynamic(() => import("./sections/productCarousel"));
const CategoryShowcase = dynamic(() => import("./sections/Categoryshowcase"));
const MediaGridSection = dynamic(() => import("./sections/mediaGridSection"));
const AestheticFullImage = dynamic(
  () => import("./sections/aestheticFullImage"),
);
const BannerSection = dynamic(() => import("./sections/bannerSection"));
const InstagramTrendsSection = dynamic(
  () => import("./sections/instagramTrendsSection"),
);
const CircularCollectionsSection = dynamic(
  () => import("./sections/circularCollectionsSection"),
);

type TrustCta =
  | { type: "modal"; text: string; ariaHint: string }
  | { type: "link"; text: string; href: string; ariaHint: string };

type TrustItem = {
  id: string;
  label: string;
  Icon: typeof ShieldCheck;
  title: string;
  detail: string;
  live?: boolean;
  cta?: TrustCta;
};

const TRUST_ITEMS: TrustItem[] = [
  {
    id: "silk",
    label: "Pure Silk",
    Icon: ShieldCheck,
    title: "Certified pure silk",
    detail: "Every saree is checked for genuine silk and zari before it ships.",
  },
  {
    id: "returns",
    label: "Returns",
    Icon: RefreshCw,
    title: "Hassle-free returns",
    detail:
      "Received a damaged or wrong saree? Show us on a quick video call or photo, and we'll make it right.",
    cta: {
      type: "link",
      text: "How it works",
      href: "/return-policy",
      ariaHint: " for our return and verification process",
    },
  },
  {
    id: "video",
    label: "Live Video Call",
    Icon: Video,
    live: true,
    title: "See it live before you buy",
    detail: "Talk to our silk experts and view the fabric in real light.",
    cta: {
      type: "modal",
      text: "Book a call",
      ariaHint: " for a video consultation with our silk experts",
    },
  },
];

const CYCLE_MS = 4500;

function TrustStrip() {
  const [active, setActive] = useState(0);
  const [userTouched, setUserTouched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-rotate until the shopper takes control.
  useEffect(() => {
    if (userTouched) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % TRUST_ITEMS.length),
      CYCLE_MS,
    );
    return () => clearInterval(id);
  }, [userTouched]);

  const current = TRUST_ITEMS[active];

  const ctaClass =
    "group flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-br from-[#7a4a45] to-[#4f2f2c] px-3.5 py-2 text-[11.5px] font-semibold text-white shadow-[0_6px_14px_-6px_rgba(79,47,44,0.7)] transition-transform active:scale-95";

  return (
    <>
      <section
        aria-label="Shopping benefits"
        className="relative z-[1] bg-gradient-to-b from-white via-[#f7f0e8] to-white px-3 py-7 sm:px-6 lg:px-10"
      >
        <style>{`
          @keyframes trust-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
          @keyframes trust-fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
          @keyframes trust-ping { 75%, 100% { transform: scale(2.2); opacity: 0 } }
          @keyframes trust-shine { from { transform: translateX(-120%) } to { transform: translateX(320%) } }
          @media (prefers-reduced-motion: reduce) {
            .trust-anim { animation: none !important }
          }
        `}</style>

        {/* Section heading */}
        <div className="mb-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a8832f]">
            The Kankana Promise
          </p>
          <h2 className="mt-1 text-[19px] font-semibold text-[#292321]">
            Silk you can trust
          </h2>
          <span className="mx-auto mt-2 block h-px w-12 bg-gradient-to-r from-transparent via-[#c9a24b] to-transparent" />
        </div>

        <div className="mx-auto max-w-[760px] overflow-hidden rounded-2xl border border-[#eadfd6] bg-white shadow-[0_10px_30px_-14px_rgba(104,65,61,0.45)]">
          {/* Gold accent line */}
          <div className="h-[3px] bg-gradient-to-r from-[#c9a24b] via-[#f0d58a] to-[#c9a24b]" />

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Why shop with us"
            className="grid grid-cols-3 bg-gradient-to-b from-white to-[#fbf8f4]"
          >
            {TRUST_ITEMS.map(({ id, label, Icon, live }, i) => {
              const isActive = i === active;
              return (
                <button
                  key={id}
                  id={`trust-tab-${id}`}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls="trust-panel"
                  onClick={() => {
                    setActive(i);
                    setUserTouched(true);
                  }}
                  className="relative flex flex-col items-center gap-1.5 px-1 pb-3 pt-3 outline-none transition-colors focus-visible:bg-[#f4ece4] active:bg-[#f4ece4]"
                >
                  <span className="relative">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                        isActive
                          ? "scale-110 bg-gradient-to-br from-[#7a4a45] to-[#4f2f2c] text-white shadow-[0_8px_16px_-6px_rgba(79,47,44,0.8)]"
                          : "bg-[#f4ece4] text-[#68413d]"
                      }`}
                    >
                      <Icon
                        aria-hidden="true"
                        className="h-[19px] w-[19px]"
                        strokeWidth={1.7}
                      />
                    </span>

                    {/* Pulsing "live" dot on the video tab */}
                    {live && (
                      <span
                        aria-hidden="true"
                        className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5"
                      >
                        <span
                          className="trust-anim absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                          style={{
                            animation: "trust-ping 1.6s ease-out infinite",
                          }}
                        />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-white bg-emerald-500" />
                      </span>
                    )}
                  </span>

                  <span
                    className={`text-[11px] leading-tight tracking-[0.01em] transition-colors ${
                      isActive
                        ? "font-semibold text-[#292321]"
                        : "font-medium text-[#6b605a]"
                    }`}
                  >
                    {label}
                  </span>

                  {/* Progress bar on the active tab */}
                  {isActive && (
                    <span className="absolute inset-x-4 bottom-0 h-[2px] overflow-hidden rounded-full bg-[#eadfd6]">
                      <span
                        key={`${active}-${userTouched}`}
                        className="trust-anim block h-full origin-left bg-[#c9a24b]"
                        style={{
                          animation: userTouched
                            ? "none"
                            : `trust-progress ${CYCLE_MS}ms linear forwards`,
                          transform: userTouched ? "scaleX(1)" : undefined,
                        }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detail panel (fixed min height so the page never jumps) */}
          <div
            id="trust-panel"
            role="tabpanel"
            aria-labelledby={`trust-tab-${current.id}`}
            aria-live="polite"
            className="flex min-h-[92px] items-center justify-between gap-3 border-t border-[#eadfd6] bg-gradient-to-br from-[#fbf8f4] to-[#f4ece4] px-4 py-3"
          >
            <div
              key={current.id}
              className="trust-anim min-w-0"
              style={{ animation: "trust-fade 300ms ease-out" }}
            >
              <p className="text-[13px] font-semibold text-[#292321]">
                {current.title}
              </p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-[#6b605a]">
                {current.detail}
              </p>
            </div>

            {current.cta?.type === "modal" && (
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => {
                  setUserTouched(true);
                  setIsModalOpen(true);
                }}
                className={`${ctaClass} relative overflow-hidden`}
              >
                {/* Soft shine sweep to draw the eye */}
                <span
                  aria-hidden="true"
                  className="trust-anim pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/25"
                  style={{ animation: "trust-shine 2.8s ease-in-out infinite" }}
                />
                <span className="relative">{current.cta.text}</span>
                <span className="sr-only">{current.cta.ariaHint}</span>
                <ArrowRight
                  aria-hidden="true"
                  className="relative h-3 w-3 transition-transform group-hover:translate-x-0.5"
                />
              </button>
            )}

            {current.cta?.type === "link" && (
              <Link
                href={current.cta.href}
                onClick={() => setUserTouched(true)}
                className={ctaClass}
              >
                {current.cta.text}
                <span className="sr-only">{current.cta.ariaHint}</span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            )}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <VideoConsultationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

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
    staleTime: 60 * 1000,
  });
  const {
    data: banners_data = [],
    isLoading: isBannerLoading,
    isError: isBannerError,
  } = useQuery<Banner[]>({
    queryKey: ["active-banners"],
    queryFn: async () => {
      const module = await import("@/lib/api/banner.api");
      return module.default.getActiveBanners();
    },
    initialData: initialBanners,
    staleTime: 60 * 1000,
  });
  const HANDPICKED = "handpicked for you";

  const normalizeTitle = (section: HomeSection) =>
    getDisplayTitle(section).trim().toLowerCase();
  const getDisplayTitle = (section: HomeSection): string => {
    // The custom type selects the renderer; the editable section title is the
    // customer-facing heading (e.g. "Our Collections").
    return section.title?.trim() || section.customTypeName || "";
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

    const customLayoutName = (section.customTypeName || "")
      .trim()
      .toLowerCase();
    if (customLayoutName === "instagram trends") {
      return (
        <InstagramTrendsSection key={section.id} section={sectionWithTitle} />
      );
    }
    if (
      customLayoutName === "circular collections" ||
      customLayoutName === "round collections"
    ) {
      return (
        <CircularCollectionsSection
          key={section.id}
          section={sectionWithTitle}
        />
      );
    }

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
      if (layout === "carousel" && normalizeTitle(section) !== HANDPICKED) {
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

      return (
        <ProductGrid
          key={section.id}
          section={sectionWithTitle}
          // Cards right under the hero are visible on a phone's first screen.
          eagerCount={index <= 1 ? 2 : 0}
        />
      );
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

  const orderedSections = [...sections].sort((a, b) => {
    const aIsHandpicked = normalizeTitle(a) === HANDPICKED;
    const bIsHandpicked = normalizeTitle(b) === HANDPICKED;

    if (aIsHandpicked !== bIsHandpicked) return aIsHandpicked ? -1 : 1;
    return (a.order ?? 0) - (b.order ?? 0);
  });

  const isCircularCollections = (s: HomeSection) => {
    const name = (s.customTypeName || "").trim().toLowerCase();
    return name === "circular collections" || name === "round collections";
  };

  // Index of the circular collections section. If it's not found (-1),
  // fall back to 0 so the strip shows after the first section.
  const trustAfterIndex = Math.max(
    0,
    orderedSections.findIndex(isCircularCollections),
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
          <h2 className="text-2xl font-futura-bold text-gray-900">Oops!</h2>
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
    <div className="home-breathing-room min-h-screen">
      {banners_data?.length > 0 && (
        <HeroSection
          banners={banners_data}
          isLoading={isBannerLoading}
          isError={isBannerError}
          error={error}
        />
      )}

      {/* TrustStrip is injected after the circular collections section below. */}
      {orderedSections.length > 0 && (
        <section className="">
          {orderedSections.map((section, index) => (
            <Fragment key={section.id}>
              {renderSection(section, index)}
              {index === trustAfterIndex && <TrustStrip />}
            </Fragment>
          ))}
        </section>
      )}

      <CTASection />
    </div>
  );
}
