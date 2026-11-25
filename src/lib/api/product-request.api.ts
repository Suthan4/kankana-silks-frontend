import clientApiService from "./api.client.service";

export type ProductRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "FULFILLED"
  | "CANCELLED"
  | "CLOSED";

export interface ProductRequestData {
  productId: string;
  variantId?: string;
  quantity?: number;
  customerNote?: string;
}

export interface ProductRequest {
  id: string;
  requestNumber: string;
  userId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  status: ProductRequestStatus;
  customerNote?: string | null;
  adminNote?: string | null;
  notifyWhenAvailable: boolean;
  estimatedAvailability?: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  fulfilledAt?: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    media?: Array<{ url: string; type: string }>;
  };
  variant?: {
    id: string;
    size?: string | null;
    color?: string | null;
    fabric?: string | null;
    sku: string;
  } | null;
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
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

class ProductRequestService {
  async createRequest(data: ProductRequestData): Promise<ProductRequestResponse> {
    const response = await clientApiService.api.post<ProductRequestResponse>(
      "/product-requests",
      data,
    );
    return response.data;
  }

  async getMyRequests(params?: {
    page?: number;
    limit?: number;
    status?: ProductRequestStatus;
  }): Promise<ProductRequestsResponse> {
    const response = await clientApiService.api.get<ProductRequestsResponse>(
      "/product-requests/my-requests",
      { params },
    );
    return response.data;
  }

  async getRequest(id: string): Promise<ProductRequestResponse> {
    const response = await clientApiService.api.get<ProductRequestResponse>(
      `/product-requests/${id}`,
    );
    return response.data;
  }

  async cancelRequest(id: string): Promise<ProductRequestResponse> {
    const response = await clientApiService.api.delete<ProductRequestResponse>(
      `/product-requests/${id}`,
    );
    return response.data;
  }
}

export const productRequestApi = new ProductRequestService();
