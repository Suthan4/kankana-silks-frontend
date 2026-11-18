export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity?: number;
};

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

const analyticsWindow = (): AnalyticsWindow | undefined =>
  typeof window === "undefined" ? undefined : (window as AnalyticsWindow);

export const analyticsConsentKey = "kankana-analytics-consent";

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(analyticsConsentKey) === "granted";
}

export function trackEvent(
  eventName: string,
  params: Record<string, unknown> = {},
): void {
  if (!hasAnalyticsConsent()) return;
  const target = analyticsWindow();
  if (!target?.gtag) return;
  target.gtag("event", eventName, params);
}

export function trackViewItem(item: AnalyticsItem, currency = "INR"): void {
  trackEvent("view_item", {
    currency,
    value: item.price,
    items: [{ ...item, quantity: 1 }],
  });
}

export function trackAddToCart(item: AnalyticsItem, currency = "INR"): void {
  trackEvent("add_to_cart", {
    currency,
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
}
