/** Shared cache keys and freshness policy for customer-facing cart surfaces. */
export const cartKeys = {
  all: ["cartApi"] as const,
  user: (userId?: string) => ["cartApi", userId] as const,
};

/**
 * Cart inventory is not reserved, so refresh quickly while customers browse.
 * Server-side checkout validation remains the final source of truth.
 */
export const cartQueryPolicy = {
  staleTime: 5_000,
  gcTime: 5 * 60_000,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
} as const;
