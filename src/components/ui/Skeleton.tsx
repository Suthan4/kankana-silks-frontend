import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/**
 * One decorative placeholder shape. It is hidden from assistive tech because a
 * dozen "empty" boxes mean nothing to a screen reader; the surrounding
 * <SkeletonGroup> announces the loading state once.
 *
 * Give it the SAME width/height/aspect-ratio as the real content so nothing
 * jumps when the data arrives (e.g. className="aspect-[4/5] w-full").
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

type SkeletonGroupProps = HTMLAttributes<HTMLDivElement> & {
  /** Text announced to screen readers while loading. */
  label?: string;
};

/**
 * Wrapper for a whole loading layout. Marks the region as busy and announces
 * `label` once, politely, via a visually hidden status element.
 */
export function SkeletonGroup({
  label = "Loading…",
  className,
  children,
  ...props
}: SkeletonGroupProps) {
  return (
    <div aria-busy="true" className={className} {...props}>
      <span role="status" className="sr-only">
        {label}
      </span>
      {children}
    </div>
  );
}
