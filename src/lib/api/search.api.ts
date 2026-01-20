import clientApiService from "./api.client.service";
import api from "./api.client.service";

export interface ProductSearchResult {
  type: "product";
  id: string;
  name: string;
  slug: string;
  description: string;
  sellingPrice: number;
  basePrice: number;
  image?: string;
  categoryName?: string;
  categorySlug?: string;
  inStock: boolean;
  relevanceScore: number;
}

export interface CategorySearchResult {
  type: "category";
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
  parentName?: string;
  relevanceScore: number;
}

export type SearchResult = ProductSearchResult | CategorySearchResult;

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  type?: "all" | "products" | "categories";
  includeInactive?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  summary: {
    total: number;
    products: number;
    categories: number;
    query: string;
  };
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Suggestion {
  name: string;
  slug: string;
  type: "product" | "category";
}

export interface SuggestionsResponse {
  products: Suggestion[];
  categories: Suggestion[];
}

const searchApi = {
  /**
   * Unified search across products and categories
   */
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const response = await clientApiService.api.get("/search", {
      params: {
        q: params.query,
        page: params.page || 1,
        limit: params.limit || 10,
        type: params.type || "all",
        includeInactive: params.includeInactive || false,
      },
    });
    return response.data.data;
  },

  /**
   * Get autocomplete suggestions
   */
  getSuggestions: async (
    query: string,
    limit: number = 5
  ): Promise<SuggestionsResponse> => {
    const response = await clientApiService.api.get("/search/suggestions", {
      params: { q: query, limit },
    });
    return response.data.data;
  },

  /**
   * Get trending searches
   */
  getTrending: async (): Promise<string[]> => {
    const response = await clientApiService.api.get("/search/trending");
    return response.data.data;
  },
};

export default searchApi;