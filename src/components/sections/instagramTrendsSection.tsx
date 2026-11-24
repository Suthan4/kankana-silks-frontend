"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShoppingBag, Play, Pause } from "lucide-react";
import SmartImage from "../common/smartImage";
import HomeSectionHeading from "../common/homeSectionHeading";
import type { HomeSection, SectionMedia } from "@/lib/api/home-section.api";

// Only one video plays at a time (also saves mobile data).
let currentlyPlaying: HTMLVideoElement | null = null;

/**
 * Cross-browser video card (Safari iOS/macOS, Edge, Chrome).
 *  - muted is set via ref: React doesn't reliably render the `muted` attribute
 *    on the server, and iOS blocks inline playback without it.
 *  - `#t=0.001` makes Safari paint the first frame instead of a black box.
 *  - play() is called only from a tap, and its promise is caught.
 *  - onError shows a fallback instead of the browser's broken-video icon.
 */
function VideoCard({ media }: { media: SectionMedia }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    return () => {
      if (currentlyPlaying === video) currentlyPlaying = null;
    };
  }, []);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      return;
    }

    if (currentlyPlaying && currentlyPlaying !== video) {
      currentlyPlaying.pause();
    }

    try {
      await video.play();
      currentlyPlaying = video;
      setHasStarted(true);
    } catch {
      // Autoplay policy block or unsupported codec.
      setFailed(true);
    }
  }, []);

  if (failed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900 px-4 text-center">
        {media.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        <p className="relative text-xs text-white/90">
          This video can&apos;t play here.
        </p>
        <a
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-900"
        >
          Open video
        </a>
      </div>
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        poster={media.thumbnailUrl || undefined}
        className="absolute inset-0 h-full w-full object-cover"
        // After the first play, native controls (seek, volume, fullscreen) appear.
        controls={hasStarted}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setFailed(true)}
        onClick={() => {
          // Before first play there are no native controls, so tap toggles.
          if (!hasStarted) togglePlay();
        }}
      >
        <source src={`${media.url}#t=0.001`} type="video/mp4" />
      </video>

      {/* Play / pause button */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause video" : "Play video"}
        className={`absolute left-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-opacity ${
          isPlaying ? "opacity-70" : "opacity-100"
        }`}
      >
        {isPlaying ? (
          <Pause size={14} fill="currentColor" />
        ) : (
          <Play size={14} fill="currentColor" />
        )}
      </button>
    </>
  );
}

function MediaCard({
  media,
  centerOnMobile = false,
}: {
  media: SectionMedia;
  centerOnMobile?: boolean;
}) {
  const href = media.linkUrl?.trim();
  const isExternal = Boolean(href && /^https?:\/\//i.test(href));
  const isVideo = media.type === "VIDEO";

  const content = (
    <>
      {isVideo ? (
        <VideoCard media={media} />
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
      {href &&
        (isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Shop this look"
            className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg transition-transform hover:scale-105 sm:h-12 sm:w-12"
          >
            <ShoppingBag size={19} strokeWidth={1.7} />
          </a>
        ) : (
          <Link
            href={href}
            aria-label="Shop this look"
            className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg transition-transform hover:scale-105 sm:h-12 sm:w-12"
          >
            <ShoppingBag size={19} strokeWidth={1.7} />
          </Link>
        ))}
      {media.title && (
        <span className="pointer-events-none absolute bottom-4 left-4 right-4 line-clamp-2 text-left text-sm font-medium tracking-wide text-white drop-shadow-md sm:text-base">
          {media.title}
        </span>
      )}
    </>
  );

  const className =
    // transform-gpu + isolate: Safari otherwise ignores rounded corners
    // (overflow-hidden) on video elements while they animate or play.
    "group relative block aspect-[3/4] min-w-0 isolate transform-gpu overflow-hidden rounded-[1.35rem] bg-neutral-100 shadow-[0_8px_24px_rgba(0,0,0,0.07)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900";

  return (
    <div
      className={`${className} ${
        centerOnMobile
          ? "col-span-2 mx-auto w-1/2 sm:col-span-1 sm:mx-0 sm:w-full"
          : ""
      }`}
    >
      {content}
    </div>
  );
}

export default function InstagramTrendsSection({
  section,
}: {
  section: HomeSection;
}) {
  const media = [...(section.media || [])].sort((a, b) => a.order - b.order);
  if (!media.length) return null;

  const desktopGridClass =
    media.length === 1
      ? "grid-cols-1 max-w-sm"
      : media.length === 2
        ? "grid-cols-2 max-w-5xl"
        : media.length === 3
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 max-w-6xl"
          : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-7xl";

  return (
    <section
      className="bg-white py-7 sm:py-12 lg:py-14"
      style={{ backgroundColor: section.backgroundColor || "#ffffff" }}
      aria-label={section.title || "Instagram trends"}
    >
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <HomeSectionHeading
          title={section.title || "Instagram Trends"}
          subtitle={section.subtitle}
          showTitle={section.showTitle}
          showSubtitle={section.showSubtitle}
          className="mb-5 sm:mb-9"
        />
        {section.description && (
          <p className="mx-auto mb-8 max-w-3xl text-center text-sm leading-7 text-neutral-600 sm:mb-10 sm:text-base sm:leading-8">
            {section.description}
          </p>
        )}
        <div
          className={`mx-auto grid w-full gap-3.5 sm:gap-5 lg:gap-6 ${desktopGridClass}`}
        >
          {media.map((item, index) => (
            <MediaCard
              key={item.id || item.url || index}
              media={item}
              centerOnMobile={media.length === 3 && index === 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
