"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { analyticsConsentKey } from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export default function AnalyticsConsent() {
  const [consent, setConsent] = useState<"unknown" | "granted" | "denied">("unknown");
  const pathname = usePathname();

  useEffect(() => {
    const saved = window.localStorage.getItem(analyticsConsentKey);
    setConsent(saved === "granted" ? "granted" : saved === "denied" ? "denied" : "unknown");
  }, []);

  useEffect(() => {
    if (consent !== "granted" || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pathname,
    });
    if (pathname === "/cart") window.gtag("event", "view_cart");
    if (pathname.startsWith("/checkout")) window.gtag("event", "begin_checkout");
  }, [consent, pathname]);

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

  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="kankana-ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              window.gtag = function(){window.dataLayer.push(arguments);};
              window.gtag('consent', 'default', {
                analytics_storage: localStorage.getItem('${analyticsConsentKey}') === 'granted' ? 'granted' : 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
              });
              window.gtag('js', new Date());
              window.gtag('config', '${GA_ID}', { send_page_view: false });
            `}
          </Script>
        </>
      )}
      {CLARITY_ID && consent === "granted" && (
        <Script id="kankana-clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </Script>
      )}
      {consent === "unknown" && (GA_ID || CLARITY_ID) && (
        <div className="fixed bottom-3 left-3 right-3 z-[100] mx-auto flex max-w-3xl flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-700">
            We use Google Analytics and Microsoft Clarity to understand site usage and improve your shopping experience. You can accept or decline analytics.
          </p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => choose("denied")} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">Decline</button>
            <button type="button" onClick={() => choose("granted")} className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white">Accept</button>
          </div>
        </div>
      )}
    </>
  );
}
