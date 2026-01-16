import clientApiService from "./api.client.service";

export const SectionType = {
  HERO_SLIDER: "HERO_SLIDER",
  NEW_ARRIVALS: "NEW_ARRIVALS",
  FEATURED: "FEATURED",
  COLLECTIONS: "COLLECTIONS",
  CATEGORIES: "CATEGORIES",
  BEST_SELLERS: "BEST_SELLERS",
  TRENDING: "TRENDING",
  SEASONAL: "SEASONAL",
  CATEGORY_SPOTLIGHT: "CATEGORY_SPOTLIGHT",
  CUSTOM: "CUSTOM",
} as const;

export type SectionTypeValue = (typeof SectionType)[keyof typeof SectionType];

export interface CTAButton {
  id: string;
  sectionId: string;
  text: string;
  url: string;
  style: "PRIMARY" | "SECONDARY" | "OUTLINE";
  icon?: string | null;
  openNewTab: boolean;
  order: number;
}

export interface SectionMedia {
  id: string;
  sectionId: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl?: string | null;
  title?: string | null;
  altText?: string | null;
  overlayTitle?: string | null;
  overlaySubtitle?: string | null;
  overlayPosition?: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  sellingPrice: number;
  sku: string;
  isActive: boolean;
  media: Array<{
    id: string;
    type: "IMAGE" | "VIDEO";
    url: string;
    order: number;
  }>;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  stock: Array<{
    quantity: number;
  }>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  children?: Category[];
}

export interface HomeSection {
  id: string;
  type: SectionTypeValue;
  title: string;
  subtitle?: string;
  description?: string;
  customTypeName?: string | null;
  isActive: boolean;
  order: number;
  limit: number;
  layout: "grid" | "carousel" | "masonry" | "slider";
  columns: number;
  backgroundColor: string;
  textColor: string;
  showTitle: boolean;
  showSubtitle: boolean;
  media: SectionMedia[];
  ctaButtons: CTAButton[];
  products: Product[];
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface HomeSectionsResponse {
  success: boolean;
  data: HomeSection[];
}

class HomeSectionService {
  async getActiveSections(): Promise<HomeSection[]> {
    try {
      const response = await clientApiService.api.get<HomeSectionsResponse>(
        "/home-sections/active"
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching active home sections:", error);
      return [];
    }
  }

  async getHomeSections(params?: {
    page?: number;
    limit?: number;
    type?: SectionTypeValue;
    isActive?: boolean;
  }): Promise<{ sections: HomeSection[]; total: number }> {
    try {
      const response = await clientApiService.api.get("/home-sections", {
        params,
      });
      return {
        sections: response.data.data.sections,
        total: response.data.data.pagination.total,
      };
    } catch (error) {
      console.error("Error fetching home sections:", error);
      return { sections: [], total: 0 };
    }
  }

  async getHomeSection(id: string): Promise<HomeSection | null> {
    try {
      const response = await clientApiService.api.get<{
        success: boolean;
        data: HomeSection;
      }>(`/home-sections/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching home section ${id}:`, error);
      return null;
    }
  }
}

const homeSectionService = new HomeSectionService();
export default homeSectionService;
