/**
 * Masks price to show only last two digits
 * Example: 12345 -> "xxx45"
 * Example: 999 -> "x99"
 */
export function maskPrice(price: number | string): string {
  const priceStr = String(price);
  
  if (priceStr.length <= 2) {
    return priceStr;
  }
  
  const lastTwo = priceStr.slice(-2);
  const maskedPart = 'x'.repeat(priceStr.length - 2);
  
  return `${maskedPart}${lastTwo}`;
}

/**
 * Formats masked price with currency symbol
 */
export function formatMaskedPrice(price: number | string): string {
  return `₹${maskPrice(price)}`;
}