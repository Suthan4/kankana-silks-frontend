import clientApiService from "./api.client.service";

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export interface Banner {
  id: string;
  title: string;
  type: MediaType;
  url: string;
  key?: string;
  thumbnailUrl?: string;
  link?: string;
  text?: string;
  mimeType?: string;
  fileSize?: string;
  duration?: number;
  width?: number;
  height?: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BannersResponse {
  success: boolean;
  data: Banner[];
}

class BannerService {
  async getActiveBanners(): Promise<Banner[]> {
    try {
      const response = await clientApiService.api.get<BannersResponse>(
        "/banners/active"
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching active banners:", error);
      return [];
    }
  }

  async getBanners(params?: {
    page?: number;
    limit?: number;
    type?: MediaType;
    isActive?: boolean;
  }): Promise<{ banners: Banner[]; total: number }> {
    try {
      const response = await clientApiService.api.get("/banners", {
        params,
      });
      return {
        banners: response.data.data.banners,
        total: response.data.data.pagination.total,
      };
    } catch (error) {
      console.error("Error fetching banners:", error);
      return { banners: [], total: 0 };
    }
  }

  async getBanner(id: string): Promise<Banner | null> {
    try {
      const response = await clientApiService.api.get<{
        success: boolean;
        data: Banner;
      }>(`/banners/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching banner ${id}:`, error);
      return null;
    }
  }
}

const bannerService = new BannerService();
export default bannerService;
