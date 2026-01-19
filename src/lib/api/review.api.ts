import { authService } from "./api.base.service";

export interface ReviewMedia {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  key?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileSize?: number;
  duration?: number;
  width?: number;
  height?: number;
  order?: number;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  images?: string[]; // Legacy field for backward compatibility
  media?: ReviewMedia[]; // New structured media field
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    media?: Array<{
      url: string;
      type: string;
    }>;
  };
  order?: {
    id: string;
    orderNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats?: {
      averageRating: number;
      totalReviews: number;
      ratingDistribution: Array<{
        rating: number;
        count: number;
      }>;
    };
  };
}

export interface ReviewResponse {
  success: boolean;
  data: Review;
}

export interface CreateReviewDTO {
  productId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  images?: string[];
  media?: Array<{
    type: "IMAGE" | "VIDEO";
    url: string;
    key?: string;
    thumbnailUrl?: string;
    mimeType?: string;
    fileSize?: number;
    duration?: number;
    width?: number;
    height?: number;
    order?: number;
  }>;
}

export interface UpdateReviewDTO {
  rating?: number;
  comment?: string;
  images?: string[];
  media?: Array<{
    type: "IMAGE" | "VIDEO";
    url: string;
    key?: string;
    thumbnailUrl?: string;
    mimeType?: string;
    fileSize?: number;
    duration?: number;
    width?: number;
    height?: number;
    order?: number;
  }>;
}

export interface QueryReviewParams {
  page?: number;
  limit?: number;
  rating?: number;
  isApproved?: boolean;
  isVerifiedPurchase?: boolean;
  sortBy?: "createdAt" | "rating" | "helpfulCount";
  sortOrder?: "asc" | "desc";
}

class ReviewApiService {
  /**
   * Create a new review
   */
  async createReview(data: CreateReviewDTO): Promise<ReviewResponse> {
    const response = await authService.api.post("/reviews", data);
    return response.data;
  }

  /**
   * Update an existing review
   */
  async updateReview(
    reviewId: string,
    data: UpdateReviewDTO
  ): Promise<ReviewResponse> {
    const response = await authService.api.put(`/reviews/${reviewId}`, data);
    return response.data;
  }

  /**
   * Delete a review
   */
  async deleteReview(
    reviewId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await authService.api.delete(`/reviews/${reviewId}`);
    return response.data;
  }

  /**
   * Get reviews for a product (public - no auth required)
   */
  async getProductReviews(
    productId: string,
    params?: QueryReviewParams
  ): Promise<ReviewsResponse> {
    const response = await authService.api.get(
      `/reviews/product/${productId}`,
      { params }
    );
    return response.data;
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(
    params?: QueryReviewParams
  ): Promise<ReviewsResponse> {
    const response = await authService.api.get("/reviews/my-reviews", {
      params,
    });
    return response.data;
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string): Promise<ReviewResponse> {
    const response = await authService.api.post(
      `/reviews/${reviewId}/helpful`
    );
    return response.data;
  }

  /**
   * Unmark review as helpful
   */
  async unmarkHelpful(reviewId: string): Promise<ReviewResponse> {
    const response = await authService.api.delete(
      `/reviews/${reviewId}/helpful`
    );
    return response.data;
  }

  /**
   * Check if user can review a product
   * Returns true if user has purchased and delivered the product and hasn't reviewed it yet
   */
  async canReviewProduct(
    productId: string
  ): Promise<{ success: boolean; data: { canReview: boolean; reason?: string } }> {
    const response = await authService.api.get(
      `/reviews/can-review/${productId}`
    );
    return response.data;
  }
}

export const reviewApi = new ReviewApiService();