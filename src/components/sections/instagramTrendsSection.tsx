"use client";

import Link from "next/link";
import { ShoppingBag, Play } from "lucide-react";
import SmartImage from "../common/smartImage";
import HomeSectionHeading from "../common/homeSectionHeading";
import type { HomeSection, SectionMedia } from "@/lib/api/home-section.api";

function MediaCard({ media }: { media: SectionMedia }) {
  const href = media.linkUrl?.trim();
  const isExternal = Boolean(href && /^https?:\/\//i.test(href));
  const content = (
    <>
      {media.type === "VIDEO" ? (
        <video
          src={media.url}
          poster={media.thumbnailUrl || undefined}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          controls
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <SmartImage
          src={media.url}
          alt={media.altText || media.title || "Kankana Silks Instagram style"}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent opacity-90" />
      {media.type === "VIDEO" && (
        <span className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm">
          <Play size={14} fill="currentColor" />
        </span>
      )}
      {href && (
        isExternal ? (
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Shop this look" className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg transition-transform hover:scale-105 sm:h-12 sm:w-12">
            <ShoppingBag size={19} strokeWidth={1.7} />
          </a>
        ) : (
          <Link href={href} aria-label="Shop this look" className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg transition-transform hover:scale-105 sm:h-12 sm:w-12">
            <ShoppingBag size={19} strokeWidth={1.7} />
          </Link>
        )
      )}
      {media.title && (
        <span className="absolute bottom-4 left-4 right-4 line-clamp-2 text-left text-sm font-medium tracking-wide text-white drop-shadow-md sm:text-base">
          {media.title}
        </span>
      )}
    </>
  );

  const className =
    "group relative block aspect-[3/4] min-w-0 overflow-hidden rounded-[1.35rem] bg-neutral-100 shadow-[0_8px_24px_rgba(0,0,0,0.07)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900";

  if (media.type === "VIDEO" || !href) return <div className={className}>{content}</div>;
  if (isExternal) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label={media.title || "View Instagram post"}>
        {content}
      </a>
    );
  }
  return (
    <Link className={className} href={href} aria-label={media.title || "Shop this look"}>
      {content}
    </Link>
  );
}

export default function InstagramTrendsSection({ section }: { section: HomeSection }) {
  const media = [...(section.media || [])].sort((a, b) => a.order - b.order);
  if (!media.length) return null;

  return (
    <section
      className="bg-white py-12 sm:py-16 lg:py-20"
      style={{ backgroundColor: section.backgroundColor || "#ffffff" }}
      aria-label={section.title || "Instagram trends"}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HomeSectionHeading
          title={section.title || "Instagram Trends"}
          subtitle={section.subtitle}
          showTitle={section.showTitle}
          showSubtitle={section.showSubtitle}
          className="mb-7 sm:mb-9"
        />
        {section.description && (
          <p className="mx-auto mb-8 max-w-3xl text-center text-sm leading-7 text-neutral-600 sm:mb-10 sm:text-base sm:leading-8">
            {section.description}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {media.map((item, index) => (
            <MediaCard key={item.id || item.url || index} media={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
