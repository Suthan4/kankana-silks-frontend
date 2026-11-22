import { cn } from "@/lib/utils/cn";

const SIZES = {
  xs: "h-3 w-3 border",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
} as const;

type SpinnerProps = {
  size?: keyof typeof SIZES;
  /** Text announced to screen readers. */
  label?: string;
  className?: string;
};

/**
 * Round spinner. Use it ONLY inside buttons (add to cart, login, coupon) and
 * on payment / checkout overlays; page-level loading uses skeletons instead.
 *
 * It inherits the surrounding text colour (border-current), so it works on
 * both dark and light buttons without extra props.
 */
export function Spinner({
  size = "sm",
  label = "Loading…",
  className,
}: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center">
      <span
        aria-hidden="true"
        className={cn(
          "inline-block animate-spin rounded-full border-current border-t-transparent",
          SIZES[size],
          className,
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
