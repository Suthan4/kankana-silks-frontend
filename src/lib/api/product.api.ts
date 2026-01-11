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
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  hasVariants?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "createdAt" | "price" | "name";
  sortOrder?: "asc" | "desc";
}

class ProductApiService {
  /**
   * Get all products with pagination and filters
   */
  async getProducts(params?: ProductQueryParams): Promise<ProductsResponse> {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    ).toString();

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
