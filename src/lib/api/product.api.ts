import clientApiService from "./api.client.service";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  sellingPrice: number;
  sku: string;
  isActive: boolean;
  hasVariants: boolean;
  hsnCode?: string;
  artisanName?: string;
  artisanAbout?: string;
  artisanLocation?: string;
  metaTitle?: string;
  metaDesc?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  media?: Array<{
    id: string;
    type: "IMAGE" | "VIDEO";
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    title?: string;
  }>;
  specifications?: Array<{
    id: string;
    key: string;
    value: string;
  }>;
  variants?: Array<{
    id: string;
    size?: string;
    color?: string;
    fabric?: string;
    price: number;
    sku: string;
    stock?: Array<{
      id: string;
      quantity: number;
      warehouseId: string;
    }>;
  }>;
  stock?: Array<{
    id: string;
    quantity: number;
    warehouseId: string;
  }>;
  _count?: {
    reviews: number;
    variants: number;
  };
  createdAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  meta?: {
    query: {
      categorySlug?: string;
      categoriesSearched: number;
    };
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

// ✅ UPDATED: Complete query params matching backend DTO
export interface ProductQueryParams {
  // Pagination
  page?: number;
  limit?: number;

  // Search
  search?: string;

  // Categories - Support multiple ways to filter
  categorySlug?: string;
  categoryId?: string;
  categoryIds?: string | string[]; // Can be comma-separated string or array

  // Product Flags
  isActive?: boolean;
  hasVariants?: boolean;

  // Price Range
  minPrice?: number;
  maxPrice?: number;

  // Sorting
  sortBy?: "createdAt" | "price" | "name" | "popularity";
  sortOrder?: "asc" | "desc";

  // Filters (Advanced)
  color?: string;
  fabric?: string;
  size?: string;
  artisan?: string;

  // Stock availability
  inStock?: boolean;
}

class ProductApiService {
  /**
   * ✅ ENHANCED: Get all products with pagination and filters
   * Supports all backend query parameters including categorySlug, variant filters, etc.
   */
  async getProducts(params?: ProductQueryParams): Promise<ProductsResponse> {
    // Build query string with proper handling of arrays
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle arrays (e.g., categoryIds)
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(","));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const response = await clientApiService.api.get(
      `/products${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<ProductResponse> {
    const response = await clientApiService.api.get(`/products/${id}`);
    return response.data;
  }

  /**
   * Get a single product by slug
   */
  async getProductBySlug(slug: string): Promise<ProductResponse> {
    const response = await clientApiService.api.get(`/products/slug/${slug}`);
    return response.data;
  }

  /**
   * Get product stock information
   */
  async getProductStock(
    productId: string,
    warehouseId: string,
    variantId?: string
  ) {
    const params = new URLSearchParams({ warehouseId });
    if (variantId) params.append("variantId", variantId);

    const response = await clientApiService.api.get(
      `/products/${productId}/stock?${params.toString()}`
    );
    return response.data;
  }
}

export const productApi = new ProductApiService();
