import clientApiService from "./api.client.service";

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    sellingPrice: number;
    media?: Array<{
      url: string;
      altText?: string;
    }>;
    stock?: Array<{
      quantity: number;
    }>;
    category?: {
      name: string;
    };
  };
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  isPublic: boolean;
  items: WishlistItem[];
  totalItems: number;
}

export interface WishlistResponse {
  success: boolean;
  data: Wishlist;
}

export interface AddToWishlistDTO {
  productId: string;
}

export interface UpdateWishlistDTO {
  isPublic: boolean;
}

class WishlistApiService {
  /**
   * Get user's wishlist
   */
  async getWishlist(): Promise<WishlistResponse> {
    const response = await clientApiService.api.get("/wishlist");
    return response.data;
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(
    data: AddToWishlistDTO
  ): Promise<{ success: boolean; message: string; data: WishlistItem }> {
    const response = await clientApiService.api.post("/wishlist/items", data);
    return response.data;
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(
    itemId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await clientApiService.api.delete(
      `/wishlist/items/${itemId}`
    );
    return response.data;
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(): Promise<{ success: boolean; message: string }> {
    const response = await clientApiService.api.delete("/wishlist");
    return response.data;
  }

  /**
   * Update wishlist visibility
   */
  async updateVisibility(
    data: UpdateWishlistDTO
  ): Promise<{ success: boolean; message: string; data: Wishlist }> {
    const response = await clientApiService.api.put(
      "/wishlist/visibility",
      data
    );
    return response.data;
  }

  /**
   * Check if product is in wishlist
   */
  async checkProduct(
    productId: string
  ): Promise<{ success: boolean; data: { isInWishlist: boolean } }> {
    const response = await clientApiService.api.get(
      `/wishlist/check/${productId}`
    );
    return response.data;
  }
}

export const wishlistApi = new WishlistApiService();
