type SkipLinkProps = {
  /** id of the <main> element to jump to. */
  targetId?: string;
  children?: React.ReactNode;
};

/**
 * First focusable element on every page. Invisible until a keyboard user tabs
 * to it, then it appears top-left. A plain in-page anchor is correct here:
 * it must not go through next/link or trigger a client-side navigation.
 *
 * The target <main> needs id={targetId} and tabIndex={-1} so focus actually
 * moves there in every browser.
 */
export function SkipLink({
  targetId = "main-content",
  children = "Skip to main content",
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black focus:shadow-lg"
    >
      {children}
    </a>
  );
}
