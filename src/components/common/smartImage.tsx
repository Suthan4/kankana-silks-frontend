import Image, { type ImageProps } from "next/image";

/**
 * Hosts configured in next.config.ts -> images.remotePatterns.
 * next/image throws at render time for any other host, so unknown hosts fall
 * back to a plain <img> instead of crashing the page.
 */
const OPTIMIZABLE_HOSTS = [
  /\.public\.blob\.vercel-storage\.com$/,
  /^kankana-bucket\.s3\.ap-south-1\.amazonaws\.com$/,
  /^d2eb3zuw9j68gk\.cloudfront\.net$/,
];

export function canOptimize(src?: string | null): src is string {
  if (!src) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    if (
      url.protocol === "http:" &&
      url.hostname === "localhost" &&
      url.port === "4566"
    ) {
      return true;
    }
    return (
      url.protocol === "https:" &&
      OPTIMIZABLE_HOSTS.some((pattern) => pattern.test(url.hostname))
    );
  } catch {
    return false;
  }
}

type SmartImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
};

/**
 * Drop-in replacement for <img> that serves a right-sized WebP through the
 * Next.js optimiser. Always pass `sizes` (how wide the image is displayed) so
 * phones don't download desktop-sized files.
 */
export default function SmartImage({
  src,
  alt,
  fill,
  priority,
  quality,
  sizes,
  className,
  style,
  loading,
  draggable,
}: SmartImageProps) {
  if (!canOptimize(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : (loading ?? "lazy")}
        draggable={draggable}
        decoding="async"
        style={
          fill
            ? {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                ...style,
              }
            : style
        }
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      quality={quality ?? 75}
      priority={priority}
      loading={priority ? undefined : loading}
      draggable={draggable}
      className={className}
      style={style}
    />
  );
}
