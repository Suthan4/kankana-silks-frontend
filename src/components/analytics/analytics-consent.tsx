"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { analyticsConsentKey } from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export default function AnalyticsConsent() {
  const [consent, setConsent] = useState<"unknown" | "granted" | "denied">(
    "unknown",
  );
  const [gaReady, setGaReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = window.localStorage.getItem(analyticsConsentKey);
    setConsent(
      saved === "granted"
        ? "granted"
        : saved === "denied"
          ? "denied"
          : "unknown",
    );
  }, []);

  useEffect(() => {
    if (consent !== "granted") return;

    if (GA_ID && !window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
      window.gtag("consent", "default", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      window.gtag("js", new Date());
      window.gtag("config", GA_ID, { send_page_view: false });

      if (!document.getElementById("kankana-ga4-script")) {
        const script = document.createElement("script");
        script.id = "kankana-ga4-script";
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);
      }
    }
    if (GA_ID) setGaReady(true);

    if (CLARITY_ID && !window.clarity) {
      window.clarity = (...args: unknown[]) => {
        const clarity = window.clarity as ((...values: unknown[]) => void) & {
          q?: unknown[][];
        };
        clarity.q = clarity.q || [];
        clarity.q.push(args);
      };
      if (!document.getElementById("kankana-clarity-script")) {
        const script = document.createElement("script");
        script.id = "kankana-clarity-script";
        script.async = true;
        script.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
        document.head.appendChild(script);
      }
    }
  }, [consent]);

  useEffect(() => {
    if (consent !== "granted" || !gaReady || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pathname,
    });
    if (pathname === "/cart") window.gtag("event", "view_cart");
    if (pathname.startsWith("/checkout"))
      window.gtag("event", "begin_checkout");
  }, [consent, gaReady, pathname]);

  const choose = (value: "granted" | "denied") => {
    window.localStorage.setItem(analyticsConsentKey, value);
    setConsent(value);
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: value === "granted" ? "granted" : "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }
  };

  return consent === "unknown" && (GA_ID || CLARITY_ID) ? (
    <div className="fixed bottom-3 left-3 right-3 z-[100] mx-auto flex max-w-3xl flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-neutral-700">
        We use small cookies to understand how people browse our collection, so
        we can make the site easier to use. Your details are never sold.{" "}
        <a href="/privacy-policy" className="underline">
          Read our privacy policy
        </a>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => choose("denied")}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          No, thanks
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white"
        >
          Sounds good
        </button>
      </div>
    </div>
  ) : null;
}
