"use client";

import { useEffect } from "react";

/**
 * Load brand webfonts without making the initial document render wait for
 * third-party stylesheet responses. System/brand fallbacks paint immediately;
 * the font files swap in after their stylesheets have downloaded.
 */
export default function DeferredBrandFonts() {
  useEffect(() => {
    const deferredStylesheets = [
      {
        id: "kankana-adobe-fonts",
        href: "https://use.typekit.net/gmp5qfk.css",
      },
      {
        id: "kankana-editorial-fonts",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Jost:wght@400;500;600&display=swap",
      },
    ];

    for (const stylesheet of deferredStylesheets) {
      const existing = document.head.querySelector<HTMLLinkElement>(
        `link[data-deferred-brand-font="${stylesheet.id}"]`,
      );

      if (existing) {
        // The stylesheet was preloaded from the server head, so switch it to
        // an active stylesheet after hydration without issuing another request.
        existing.rel = "stylesheet";
        existing.removeAttribute("as");
        continue;
      }

      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "style";
      link.href = stylesheet.href;
      link.dataset.deferredBrandFont = stylesheet.id;
      link.onload = () => {
        link.rel = "stylesheet";
        link.removeAttribute("as");
      };

      document.head.appendChild(link);
    }
  }, []);

  return null;
}
