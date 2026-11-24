"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SmartImage from "../common/smartImage";
import HomeSectionHeading from "../common/homeSectionHeading";
import type { HomeSection, SectionMedia } from "@/lib/api/home-section.api";

export default function CircularCollectionsSection({ section }: { section: HomeSection }) {
  const media = [...(section.media || [])].sort((a, b) => a.order - b.order);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  if (!media.length) return null;

  const scrollTo = useCallback((index: number) => {
    const track = trackRef.current;
    const item = track?.children.item(index) as HTMLElement | null;
    if (!track || !item) return;
    track.scrollTo({ left: item.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setActiveIndex(index);
  }, []);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const children = Array.from(track.children) as HTMLElement[];
    if (!children.length) return;
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    children.forEach((child, index) => {
      const nextDistance = Math.abs(child.offsetLeft - track.scrollLeft);
      if (nextDistance < distance) {
        distance = nextDistance;
        nearest = index;
      }
    });
    setActiveIndex(nearest);
  };

  const renderCard = (item: SectionMedia, index: number) => {
    const href = item.linkUrl?.trim();
    const image = (
      <>
        <span className="relative block aspect-square overflow-hidden rounded-full bg-neutral-100 ring-1 ring-black/[0.04] transition-all duration-500 group-hover:shadow-[0_14px_35px_rgba(0,0,0,0.12)]">
          <SmartImage
            src={item.url}
            alt={item.altText || item.title || "Kankana Silks collection"}
            fill
            sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 44vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </span>
        {item.title && (
          <span className="mt-3 block min-h-[2.8rem] text-center font-[Jost,sans-serif] text-sm font-medium leading-6 tracking-[-0.02em] text-neutral-900 sm:mt-4 sm:text-base">
            {item.title}
          </span>
        )}
      </>
    );
    const className = "group block w-[44%] flex-none snap-start text-center sm:w-[29%] md:w-[21%] lg:w-[16%]";
    if (!href) return <div key={item.id || item.url || index} className={className}>{image}</div>;
    if (/^https?:\/\//i.test(href)) {
      return <a key={item.id || item.url || index} className={className} href={href} target="_blank" rel="noopener noreferrer">{image}</a>;
    }
    return <Link key={item.id || item.url || index} className={className} href={href}>{image}</Link>;
  };

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20" style={{ backgroundColor: section.backgroundColor || "#ffffff" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HomeSectionHeading
          title={section.title || "Our Collections"}
          subtitle={section.subtitle}
          showTitle={section.showTitle}
          showSubtitle={section.showSubtitle}
          className="mb-8 sm:mb-10"
        />
        {section.description && (
          <p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-7 text-neutral-600 sm:text-base">{section.description}</p>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            aria-label="Previous collections"
            className="absolute -left-2 top-[38%] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-800 shadow-md transition hover:bg-neutral-50 disabled:opacity-30 md:flex"
          ><ChevronLeft size={19} /></button>
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6 md:gap-7"
          >
            {media.map(renderCard)}
          </div>
          <button
            type="button"
            onClick={() => scrollTo(Math.min(media.length - 1, activeIndex + 1))}
            disabled={activeIndex >= media.length - 1}
            aria-label="Next collections"
            className="absolute -right-2 top-[38%] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-800 shadow-md transition hover:bg-neutral-50 disabled:opacity-30 md:flex"
          ><ChevronRight size={19} /></button>
        </div>
        {media.length > 1 && (
          <div className="mt-7 flex items-center justify-center gap-2.5" aria-label="Choose collection">
            {media.map((item, index) => (
              <button
                key={item.id || item.url || index}
                type="button"
                onClick={() => scrollTo(index)}
                aria-label={`Go to collection ${index + 1}`}
                aria-current={activeIndex === index ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all duration-300 ${activeIndex === index ? "w-7 bg-neutral-900" : "w-2.5 bg-neutral-300 hover:bg-neutral-500"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
