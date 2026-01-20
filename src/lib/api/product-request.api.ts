import clientApiService from "./api.client.service";

export interface ProductRequestData {
  productId: string;
  variantId?: string;
  message?: string;
  requestType: "CONSULTATION" | "OUT_OF_STOCK";
}

export interface ProductRequest {
  id: string;
  userId: string;
  productId: string;
  variantId?: string;
  productName: string;
  productSlug: string;
  variantDetails?: {
    size?: string;
    color?: string;
    fabric?: string;
    attributes?: Record<string, string>;
  };
  requestType: "CONSULTATION" | "OUT_OF_STOCK";
  status: "PENDING" | "CONTACTED" | "COMPLETED" | "CANCELLED";
  message?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequestResponse {
  success: boolean;
  data: ProductRequest;
  message?: string;
}

export interface ProductRequestsResponse {
  success: boolean;
  data: {
    requests: ProductRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

class ProductRequestService {
  /**
   * Create a new product request (consultation or out-of-stock)
   */
  async createRequest(data: ProductRequestData): Promise<ProductRequestResponse> {
    const response = await clientApiService.api.post<ProductRequestResponse>(
      "/product-requests",
      data
    );
    return response.data;
  }

  /**
   * Get user's product requests
   */
  async getMyRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    requestType?: string;
  }): Promise<ProductRequestsResponse> {
    const response = await clientApiService.api.get<ProductRequestsResponse>(
      "/product-requests/my-requests",
      { params }
    );
    return response.data;
  }

  /**
   * Get a single product request by ID
   */
  async getRequest(id: string): Promise<ProductRequestResponse> {
    const response = await clientApiService.api.get<ProductRequestResponse>(
      `/product-requests/${id}`
    );
    return response.data;
  }

  /**
   * Cancel a product request
   */
  async cancelRequest(id: string): Promise<ProductRequestResponse> {
    const response = await clientApiService.api.post<ProductRequestResponse>(
      `/product-requests/${id}/cancel`
    );
    return response.data;
  }
}

export const productRequestApi = new ProductRequestService();