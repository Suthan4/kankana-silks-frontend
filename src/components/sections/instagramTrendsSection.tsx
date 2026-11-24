"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShoppingBag, Play, Pause, Loader2 } from "lucide-react";
import SmartImage from "../common/smartImage";
import HomeSectionHeading from "../common/homeSectionHeading";
import type { HomeSection, SectionMedia } from "@/lib/api/home-section.api";

// Only one video plays at a time (also saves mobile data).
let currentlyPlaying: HTMLVideoElement | null = null;

const MEDIA_ERROR_NAMES: Record<number, string> = {
  1: "ABORTED",
  2: "NETWORK",
  3: "DECODE",
  4: "SRC_NOT_SUPPORTED (bad codec, wrong content-type, or no Range support)",
};

/**
 * Cross-browser video card (Safari iOS/macOS, Edge, Chrome).
 *
 * Loading strategy:
 *  1. Normal streaming via <video src>.
 *  2. If Safari rejects it (very common when the server has the wrong
 *     Content-Type or doesn't answer Range requests), download the file
 *     once, wrap it in a Blob typed as video/mp4, and play that instead.
 *     Blob playback needs no Range support and ignores the server's type.
 *  3. If that also fails (e.g. the codec itself is unsupported, or CORS blocks
 *     the download), show a clean "Open video" fallback instead of a broken icon.
 *
 * What code cannot fix: a file whose codec Safari can't decode (HEVC variants,
 * VP9, AV1, 10-bit). The console message below tells you exactly which case it is.
 */
function VideoCard({ media }: { media: SectionMedia }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const triedBlob = useRef(false);
  const blobUrl = useRef<string | null>(null);
  const playWhenReady = useRef(false);

  const [src, setSrc] = useState(`${media.url}#t=0.001`);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [failed, setFailed] = useState(false);

  // Runs on mount and again whenever the <video> is re-created (src change).
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
  }, [src]);

  // Free the downloaded blob when the card unmounts.
  useEffect(() => {
    return () => {
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    };
  }, []);

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
    } catch (err) {
      const name = (err as DOMException)?.name;
      if (name === "NotSupportedError") {
        // Remember the tap and resume once the recovered video is ready.
        playWhenReady.current = true;
        recoverWithBlob();
      } else if (name !== "AbortError" && name !== "NotAllowedError") {
        setFailed(true);
      }
    }
  }, [recoverWithBlob]);

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
        className="absolute inset-0 h-full w-full object-cover"
        controls={hasStarted}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={handleError}
        onLoadedData={() => {
          if (playWhenReady.current) {
            playWhenReady.current = false;
            togglePlay();
          }
        }}
        onClick={() => {
          if (!hasStarted) togglePlay();
        }}
      />

      {recovering && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/30">
          <Loader2 className="h-7 w-7 animate-spin text-white" />
        </div>
      )}

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
