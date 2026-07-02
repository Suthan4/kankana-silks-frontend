import clientApiService from "./api.client.service";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  image?: string | null;

  // Legacy field — do not use this to build the hierarchy.
  parentId?: string | null;

  isRoot: boolean;
  isActive: boolean;
  order: number;

  hasVideoConsultation: boolean;
  videoPurchasingEnabled: boolean;
  videoConsultationNote?: string | null;

  children: Category[];

  productCount?: number;

  createdAt: string;
  updatedAt: string;
}

interface ApiProductCount {
  products: number;
}

interface ApiCategoryPlacement {
  id: string;
  parentId: string;
  childId: string;
  order: number;
  child: ApiCategory;
  createdAt: string;
  updatedAt: string;
}

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  image?: string | null;
  parentId?: string | null;

  isRoot: boolean;
  isActive: boolean;
  order: number;

  hasVideoConsultation: boolean;
  videoPurchasingEnabled: boolean;
  videoConsultationNote?: string | null;

  childPlacements?: ApiCategoryPlacement[];

  _count?: ApiProductCount;

  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeResponse {
  success: boolean;
  data: ApiCategory[];
}

const normalizeCategory = (category: ApiCategory): Category => {
  const {
    childPlacements = [],
    _count,
    ...categoryData
  } = category;

  const sortedPlacements = [...childPlacements].sort(
    (first, second) => first.order - second.order,
  );

  return {
    ...categoryData,

    productCount: _count?.products ?? 0,

    children: sortedPlacements
      .map((placement) => placement.child)
      .filter((child) => child.isActive)
      .map(normalizeCategory),
  };
};


class CategoryService {
  async getCategoryTree(): Promise<Category[]> {
    try {
      const response = await clientApiService.api.get<CategoryTreeResponse>(
        "/categories/tree"
      );
      return response.data.data
        .filter((category) => category.isActive)
        .map(normalizeCategory);
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
