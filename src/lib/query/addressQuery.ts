export const addressKeys = {
  all: ["addresses"] as const,
  user: (userId?: string) => ["addresses", userId] as const,
  lists: () => ["addresses", "list"] as const,
  detail: (id: string) => ["addresses", "detail", id] as const,
  default: () => ["addresses", "default"] as const,
};

export const addressQueryPolicy = {
  staleTime: 60 * 1000,
};
