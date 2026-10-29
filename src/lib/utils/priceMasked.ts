/**
 * Masks an out-of-stock price while preserving Indian digit grouping.
 * Only the last two integer digits remain visible.
 *
 * Examples:
 * 72999   -> "xx,x99"
 * 127999  -> "x,xx,x99"
 * 1299    -> "xx99"
 * 99      -> "99"
 */
export function maskPrice(price: number | string): string {
  const normalized = String(price).replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  if (!normalized || !Number.isFinite(parsed) || parsed < 0) return "xxxx";

  const grouped = Math.trunc(parsed).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
  const digitPositions = [...grouped.matchAll(/[0-9]/g)].map(
    (match) => match.index!,
  );
  if (digitPositions.length <= 2) return grouped;

  const maskedPositions = new Set(digitPositions.slice(0, -2));
  return [...grouped]
    .map((character, index) => (maskedPositions.has(index) ? "x" : character))
    .join("");
}

/** Formats an out-of-stock price with a rupee symbol. */
export function formatMaskedPrice(price: number | string): string {
  return `₹${maskPrice(price)}`;
}
