import clientApiService from "./api.client.service";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeResponse {
  success: boolean;
  data: Category[];
}

class CategoryService {
  async getCategoryTree(): Promise<Category[]> {
    try {
      const response = await clientApiService.api.get<CategoryTreeResponse>(
        "/categories/tree"
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching category tree:", error);
      return [];
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const response = await clientApiService.api.get<{
        success: boolean;
        data: Category;
      }>(`/categories/slug/${slug}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching category ${slug}:`, error);
      return null;
    }
  }

  async getCategories(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    parentId?: string;
  }): Promise<{ categories: Category[]; total: number }> {
    try {
      const response = await clientApiService.api.get("/categories", {
        params,
      });
      return {
        categories: response.data.data.categories,
        total: response.data.data.pagination.total,
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { categories: [], total: 0 };
    }
  }
}

const categoryService = new CategoryService();
export default categoryService;
