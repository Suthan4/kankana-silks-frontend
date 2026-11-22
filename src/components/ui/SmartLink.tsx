import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type SmartLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  /** Open in a new tab. Adds rel="noopener noreferrer" automatically. */
  openInNewTab?: boolean;
  children: ReactNode;
};

/** Site-internal path such as "/shop/silk" (not "//cdn.x.com" or "https://…"). */
export function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

function withSafeRel(rel?: string): string {
  const tokens = new Set((rel ?? "").split(/\s+/).filter(Boolean));
  tokens.add("noopener");
  tokens.add("noreferrer");
  return Array.from(tokens).join(" ");
}

/**
 * For hrefs that come from data (CMS banners, footer config) where we can't
 * know at build time whether the target is internal.
 *
 *  - internal path  -> next/link (client-side navigation, prefetching)
 *  - external / mailto: / tel: / #hash -> plain <a>
 *
 * Opening a new tab always gets rel="noopener noreferrer" and a visually
 * hidden hint so screen-reader users know focus is about to leave the page.
 */
export function SmartLink({
  href,
  openInNewTab = false,
  target,
  rel,
  children,
  ...rest
}: SmartLinkProps) {
  const newTab = openInNewTab || target === "_blank";

  const content = (
    <>
      {children}
      {newTab && <span className="sr-only"> (opens in a new tab)</span>}
    </>
  );

  const targetProps = newTab
    ? { target: "_blank", rel: withSafeRel(rel) }
    : { target, rel };

  if (isInternalHref(href)) {
    return (
      <Link href={href} {...targetProps} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} {...targetProps} {...rest}>
      {content}
    </a>
  );
}
