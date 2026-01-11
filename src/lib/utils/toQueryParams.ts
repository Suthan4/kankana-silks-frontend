import type { ParsedUrlQueryInput } from "querystring";

/**
 * Converts any params object into a Next.js-safe query object
 * - Removes undefined / null
 * - Converts numbers & booleans to strings
 * - Supports arrays
 */
export function toQueryParams<T extends Record<string, any>>(
  params: T
): ParsedUrlQueryInput {
  const query: ParsedUrlQueryInput = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      query[key] = value.map(String);
    } else {
      query[key] = String(value);
    }
  });

  return query;
}
