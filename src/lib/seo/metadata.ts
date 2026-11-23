const BRAND_SUFFIX = /\s*(?:[|–—-]\s*)?Kankana Silks\s*$/i;

export function seoPageTitle(
  value: string | null | undefined,
  fallback: string,
  maxLength = 42,
): string {
  let title = (value?.trim() || fallback).replace(/\s+/g, " ").trim();

  while (BRAND_SUFFIX.test(title)) {
    title = title.replace(BRAND_SUFFIX, "").trim();
  }

  if (title.length <= maxLength) return title;

  const candidate = title.slice(0, maxLength);
  const lastSpace = candidate.lastIndexOf(" ");
  const shortened = (lastSpace > 20 ? candidate.slice(0, lastSpace) : candidate)
    .replace(/[|–—-]+\s*$/, "")
    .trim();

  return shortened || title.slice(0, maxLength).trim();
}

export function brandedSeoTitle(title: string): string {
  return title ? title + " | Kankana Silks" : "Kankana Silks";
}

export function seoPageDescription(
  value: string | null | undefined,
  fallback: string,
  maxLength = 155,
): string {
  const description = (value?.trim() || fallback).replace(/\s+/g, " ").trim();
  if (description.length <= maxLength) return description;

  const candidate = description.slice(0, maxLength - 1);
  const lastSpace = candidate.lastIndexOf(" ");
  const shortened = (lastSpace > 90 ? candidate.slice(0, lastSpace) : candidate)
    .replace(/[.,;:!?]+\s*$/, "")
    .trim();

  return shortened
    ? shortened + "…"
    : description.slice(0, maxLength - 1).trim() + "…";
}
