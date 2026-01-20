import clientApiService from "./api.client.service";

export type MediaType = "IMAGE" | "VIDEO";

export interface ProductMedia {
  id: string;
  productId?: string;
  variantId?: string | null;
  type: MediaType;
  url: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  title?: string | null;
  key?: string | null;
}

export interface ProductSpecification {
  id: string;
  key: string;
  value: string;
  productId?: string;
  createdAt?: string;
}

export interface ProductStock {
  id: string;
  productId: string;
  variantId?: string | null;
  warehouseId: string;
  quantity: number;
  lowStockThreshold?: number;
  updatedAt?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;

  size?: string | null;
  color?: string | null;
  fabric?: string | null;

  // ✅ backend returns string
  price: string;
  basePrice?: string | null;
  sellingPrice?: string | null;

  sku: string;

  // ✅ NEW (you have this)
  attributes?: Record<string, string>;

  // ✅ backend returns string
  length?: string | null;
  breadth?: string | null;
  height?: string | null;
  weight?: string | null;
  volumetricWeight?: string | null;

  media?: ProductMedia[];
  stock?: ProductStock[];

  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;

  categoryId: string;
  category?: ProductCategory;

  sku: string;
  isActive: boolean;
  hasVariants: boolean;

  // ✅ backend returns string
  basePrice: string;
  sellingPrice: string;

  hsnCode?: string | null;

  artisanName?: string | null;
  artisanAbout?: string | null;
  artisanLocation?: string | null;

  metaTitle?: string | null;
  metaDesc?: string | null;
  schemaMarkup?: any;

  hasVideoConsultation:boolean;
  videoPurchasingEnabled:boolean;
  videoConsultationNote:string
  allowOutOfStockOrders:boolean;

  // ✅ product dimensions also string
  length?: string | null;
  breadth?: string | null;
  height?: string | null;
  weight?: string | null;
  volumetricWeight?: string | null;

  media?: ProductMedia[];
  specifications?: ProductSpecification[];

  variants?: ProductVariant[];
  stock?: ProductStock[];

  _count?: {
    reviews: number;
    variants: number;
  };

  createdAt: string;
  updatedAt?: string;
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