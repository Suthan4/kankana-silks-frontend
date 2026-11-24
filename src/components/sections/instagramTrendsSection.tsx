"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShoppingBag, Play, Volume2, VolumeX, Loader2 } from "lucide-react";
import SmartImage from "../common/smartImage";
import HomeSectionHeading from "../common/homeSectionHeading";
import type { HomeSection, SectionMedia } from "@/lib/api/home-section.api";

/**
 * Card shape. Mobile is taller (closer to a reel) so cards feel bigger and
 * tappable; from `sm` up it returns to the classic 3:4.
 * Want it even taller? Try aspect-[9/16]. Shorter? Try aspect-[2/3].
 */
const CARD_ASPECT = "aspect-[9/14] sm:aspect-[3/4]";

// Every mounted video, so unmuting one can mute the rest.
const allVideos = new Set<HTMLVideoElement>();

const MEDIA_ERROR_NAMES: Record<number, string> = {
  1: "ABORTED",
  2: "NETWORK",
  3: "DECODE",
  4: "SRC_NOT_SUPPORTED (bad codec, wrong content-type, or no Range support)",
};

function canAutoplay(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;
  const conn = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (conn?.saveData) return false;
  return true;
}

/**
 * Interactive, cross-browser video card (Safari iOS/macOS, Edge, Chrome).
 *
 *  - Plays muted automatically when it scrolls into view, pauses when it leaves.
 *  - Tap the card to pause / resume. A large play button shows when paused.
 *  - Sound toggle (top-left) and a thin progress bar (bottom).
 *  - Loading: normal streaming first; if Safari rejects it, download once and
 *    play from a video/mp4 Blob; if that fails too, show an "Open video" card.
 *
 * Code cannot fix a file whose codec Safari can't decode (HEVC variants, VP9,
 * AV1, 10-bit). The console message tells you exactly which case it is.
 */
function VideoCard({ media }: { media: SectionMedia }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const triedBlob = useRef(false);
  const blobUrl = useRef<string | null>(null);
  const playWhenReady = useRef(false);
  const inView = useRef(false);
  const userPaused = useRef(false);

  const [src, setSrc] = useState(`${media.url}#t=0.001`);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [failed, setFailed] = useState(false);

  const recoverWithBlob = useCallback(async () => {
    if (triedBlob.current) {
      setFailed(true);
      return;
    }
    triedBlob.current = true;
    setRecovering(true);
    try {
      const res = await fetch(media.url, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = await res.arrayBuffer();
      const blob = new Blob([buffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      blobUrl.current = url;
      setSrc(url);
    } catch (err) {
      console.warn("[video] blob recovery failed (CORS or network):", err);
      setFailed(true);
    } finally {
      setRecovering(false);
    }
  }, [media.url]);

  const attemptPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
    } catch (err) {
      const name = (err as DOMException)?.name;
      if (name === "NotSupportedError") {
        // Resume automatically once the recovered video is ready.
        playWhenReady.current = true;
        recoverWithBlob();
      } else if (name !== "AbortError" && name !== "NotAllowedError") {
        setFailed(true);
      }
    }
  }, [recoverWithBlob]);

  // Runs on mount and whenever the <video> is re-created (src change).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    setIsMuted(true);
    allVideos.add(video);

    // Autoplay (muted) while at least 60% of the card is visible.
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          if (canAutoplay() && !userPaused.current) attemptPlay();
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(video);

    return () => {
      observer.disconnect();
      allVideos.delete(video);
    };
  }, [src, attemptPlay]);

  // Free the downloaded blob when the card unmounts.
  useEffect(() => {
    return () => {
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    };
  }, []);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const err = e.currentTarget.error;
      console.warn(
        `[video] failed to load ${media.url} ->`,
        err ? (MEDIA_ERROR_NAMES[err.code] ?? err.code) : "unknown",
      );
      recoverWithBlob();
    },
    [media.url, recoverWithBlob],
  );

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      userPaused.current = true;
      video.pause();
    } else {
      userPaused.current = false;
      attemptPlay();
    }
  }, [attemptPlay]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    if (!nextMuted) {
      // Only one video makes sound at a time.
      allVideos.forEach((other) => {
        if (other !== video) other.muted = true;
      });
    }
    video.muted = nextMuted;
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
        // key forces a fresh element when the source switches to the blob,
        // which is the reliable way to make Safari reload.
        key={src}
        ref={videoRef}
        src={src}
        poster={media.thumbnailUrl || undefined}
        className="absolute inset-0 h-full w-full cursor-pointer object-cover"
        muted
        loop
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
        onError={handleError}
        onLoadedData={() => {
          if (
            playWhenReady.current ||
            (inView.current && canAutoplay() && !userPaused.current)
          ) {
            playWhenReady.current = false;
            attemptPlay();
          }
        }}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (progressRef.current && v.duration) {
            progressRef.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
          }
        }}
      />

      {/* Large play button while paused */}
      {!isPlaying && !recovering && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play video"
          className="absolute left-1/2 top-1/2 z-10 inline-flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#4f2f2c] shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-transform active:scale-90"
        >
          <Play size={22} fill="currentColor" className="ml-0.5" />
        </button>
      )}

      {recovering && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/30">
          <Loader2 className="h-7 w-7 animate-spin text-white" />
        </div>
      )}

      {/* Sound toggle */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Turn sound on" : "Turn sound off"}
        aria-pressed={!isMuted}
        className="absolute left-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-transform active:scale-90"
      >
        {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
      </button>

      {/* Progress bar */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[3px] bg-white/25"
      >
        <span
          ref={progressRef}
          className="block h-full origin-left bg-white"
          style={{ transform: "scaleX(0)" }}
        />
      </span>
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
            className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg transition-transform hover:scale-105 active:scale-90 sm:h-12 sm:w-12"
          >
            <ShoppingBag size={19} strokeWidth={1.7} />
          </a>
        ) : (
          <Link
            href={href}
            aria-label="Shop this look"
            className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg transition-transform hover:scale-105 active:scale-90 sm:h-12 sm:w-12"
          >
            <ShoppingBag size={19} strokeWidth={1.7} />
          </Link>
        ))}
      {media.title && (
        <span className="pointer-events-none absolute bottom-5 left-4 right-4 line-clamp-2 text-left text-sm font-medium tracking-wide text-white drop-shadow-md sm:text-base">
          {media.title}
        </span>
      )}
    </>
  );

  const className = `group relative block ${CARD_ASPECT} min-w-0 isolate transform-gpu overflow-hidden rounded-[1.35rem] bg-neutral-100 shadow-[0_8px_24px_rgba(0,0,0,0.07)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900`;
  // transform-gpu + isolate: Safari otherwise ignores rounded corners
  // (overflow-hidden) on video elements while they animate or play.

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
