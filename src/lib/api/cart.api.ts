import clientApiService from "./api.client.service";

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string;
  quantity: number;
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
  };
  variant?: {
    id: string;
    size?: string;
    color?: string;
    fabric?: string;
    price: number;
    
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

export interface CartResponse {
  success: boolean;
  data: Cart;
}

export interface AddToCartDTO {
  productId: string;
  variantId?: string;
  quantity?: number;
}

export interface UpdateCartItemDTO {
  quantity: number;
}

class CartApiService {
  /**
   * Get user's cart
   */
  async getCart() {
    const response = await clientApiService.api.get("/cart");
    return response.data;
  }

  /**
   * Get cart item count
   */
  async getCartCount(): Promise<{ success: boolean; data: { count: number } }> {
    const response = await clientApiService.api.get("/cart/count");
    return response.data;
  }

  /**
   * Add item to cart
   */
  async addToCart(
    data: AddToCartDTO
  ): Promise<{ success: boolean; message: string; data: CartItem }> {
    const response = await clientApiService.api.post("/cart/items", data);
    return response.data;
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    itemId: string,
    data: UpdateCartItemDTO
  ): Promise<{ success: boolean; message: string; data: CartItem }> {
    const response = await clientApiService.api.put(
      `/cart/items/${itemId}`,
      data
    );
    return response.data;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(
    itemId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await clientApiService.api.delete(`/cart/items/${itemId}`);
    return response.data;
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<{ success: boolean; message: string }> {
    const response = await clientApiService.api.delete("/cart");
    return response.data;
  }
}

export const cartApi = new CartApiService();
