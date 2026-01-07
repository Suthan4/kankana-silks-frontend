import axios, { AxiosInstance, AxiosError } from "axios";
import {
  ApiResponse,
  PaginatedResponse,
  Product,
  Category,
  Order,
  Warehouse,
  Consultation,
  Banner,
  Coupon,
  HomeSection,
} from "@/lib/admin/types/api";
import {
  User,
  Permission,
  LoginCredentials,
  AuthTokens,
} from "@/lib/admin/types/auth";
import { BaseApiService } from "./api.base.service";

class AdminApiService extends BaseApiService {
  constructor() {
    super(()=>{
      window.location.href="/admin/login"
    }); // Redirect to admin login on auth failure
  }

  // Admin Management
  async createAdmin(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: "SUPER_ADMIN";
  }) {
    return this.api.post<ApiResponse<User>>("/admin/create-admin", data);
  }

  async setPermissions(data: {
    userId: string;
    module: string;
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  }) {
    return this.api.post<ApiResponse<Permission>>("/admin/permissions", data);
  }

  async getUserPermissions(userId: string) {
    return this.api.get<ApiResponse<Permission[]>>(
      `/admin/permissions/${userId}`
    );
  }

  // Products
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    return this.api.get<ApiResponse<PaginatedResponse<Product>>>("/products", {
      params,
    });
  }

  async getProduct(id: string) {
    return this.api.get<ApiResponse<Product>>(`/products/${id}`);
  }

  async createProduct(data: FormData) {
    return this.api.post<ApiResponse<Product>>("/admin/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async updateProduct(id: string, data: FormData) {
    return this.api.put<ApiResponse<Product>>(`/admin/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async deleteProduct(id: string) {
    return this.api.delete<ApiResponse<void>>(`/admin/products/${id}`);
  }

  async bulkUploadProducts(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.api.post<ApiResponse<{ imported: number; failed: number }>>(
      "/admin/products/bulk-upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  }

  // Categories
  async getCategories(params?: { page?: number; limit?: number }) {
    return this.api.get<ApiResponse<PaginatedResponse<Category>>>(
      "/categories",
      { params }
    );
  }

  async getCategory(id: string) {
    return this.api.get<ApiResponse<Category>>(`/categories/${id}`);
  }

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    isActive: boolean;
  }) {
    return this.api.post<ApiResponse<Category>>("/admin/categories", data);
  }

  async updateCategory(id: string, data: Partial<Category>) {
    return this.api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
  }

  async deleteCategory(id: string) {
    return this.api.delete<ApiResponse<void>>(`/admin/categories/${id}`);
  }

  // Orders
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    return this.api.get<ApiResponse<PaginatedResponse<Order>>>(
      "/admin/orders",
      { params }
    );
  }

  async getOrder(id: string) {
    return this.api.get<ApiResponse<Order>>(`/admin/orders/${id}`);
  }

  async updateOrderStatus(
    id: string,
    data: { status: string; notes?: string }
  ) {
    return this.api.put<ApiResponse<Order>>(`/admin/orders/${id}/status`, data);
  }

  async getOrderAnalytics(params: { startDate: string; endDate: string }) {
    return this.api.get<ApiResponse<any>>("/admin/orders/analytics", {
      params,
    });
  }

  // Warehouses
  async getWarehouses(params?: { page?: number; limit?: number }) {
    return this.api.get<ApiResponse<PaginatedResponse<Warehouse>>>(
      "/admin/warehouses",
      { params }
    );
  }

  async getActiveWarehouses() {
    return this.api.get<ApiResponse<Warehouse[]>>("/admin/warehouses/active");
  }

  async createWarehouse(
    data: Omit<Warehouse, "id" | "createdAt" | "updatedAt">
  ) {
    return this.api.post<ApiResponse<Warehouse>>("/admin/warehouses", data);
  }

  async updateWarehouse(id: string, data: Partial<Warehouse>) {
    return this.api.put<ApiResponse<Warehouse>>(
      `/admin/warehouses/${id}`,
      data
    );
  }

  async deleteWarehouse(id: string) {
    return this.api.delete<ApiResponse<void>>(`/admin/warehouses/${id}`);
  }

  async getWarehouseStock(id: string) {
    return this.api.get<ApiResponse<any>>(`/admin/warehouses/${id}/stock`);
  }

  // Consultations
  async getConsultations(params?: { page?: number; limit?: number }) {
    return this.api.get<ApiResponse<PaginatedResponse<Consultation>>>(
      "/admin/consultations",
      { params }
    );
  }

  async updateConsultationStatus(
    id: string,
    data: { status: string; meetingLink?: string }
  ) {
    return this.api.put<ApiResponse<Consultation>>(
      `/admin/consultations/${id}/status`,
      data
    );
  }

  // Banners
  async getBanners(params?: { page?: number; limit?: number }) {
    return this.api.get<ApiResponse<PaginatedResponse<Banner>>>(
      "/admin/banners",
      { params }
    );
  }

  async createBanner(data: FormData) {
    return this.api.post<ApiResponse<Banner>>("/admin/banners", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async updateBanner(id: string, data: FormData) {
    return this.api.put<ApiResponse<Banner>>(`/admin/banners/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async deleteBanner(id: string) {
    return this.api.delete<ApiResponse<void>>(`/admin/banners/${id}`);
  }

  // Coupons
  async getCoupons(params?: { page?: number; limit?: number }) {
    return this.api.get<ApiResponse<PaginatedResponse<Coupon>>>(
      "/admin/coupons",
      { params }
    );
  }

  async createCoupon(
    data: Omit<Coupon, "id" | "usedCount" | "createdAt" | "updatedAt">
  ) {
    return this.api.post<ApiResponse<Coupon>>("/admin/coupons", data);
  }

  async updateCoupon(id: string, data: Partial<Coupon>) {
    return this.api.put<ApiResponse<Coupon>>(`/admin/coupons/${id}`, data);
  }

  async deleteCoupon(id: string) {
    return this.api.delete<ApiResponse<void>>(`/admin/coupons/${id}`);
  }

  // Home Sections
  async getHomeSections() {
    return this.api.get<ApiResponse<HomeSection[]>>("/home-sections");
  }

  async createHomeSection(data: { title: string; productIds: string[] }) {
    return this.api.post<ApiResponse<HomeSection>>("/home-sections", data);
  }

  async updateHomeSection(id: string, data: Partial<HomeSection>) {
    return this.api.put<ApiResponse<HomeSection>>(`/home-sections/${id}`, data);
  }

  async deleteHomeSection(id: string) {
    return this.api.delete<ApiResponse<void>>(`/home-sections/${id}`);
  }

  // Users
  async getUsers(params?: { page?: number; limit?: number }) {
    return this.api.get<ApiResponse<PaginatedResponse<User>>>("/admin/users", {
      params,
    });
  }

  async updateUserRole(userId: string, role: string) {
    return this.api.put<ApiResponse<User>>(`/admin/users/${userId}/role`, {
      role,
    });
  }

  async toggleUserStatus(userId: string) {
    return this.api.put<ApiResponse<User>>(
      `/admin/users/${userId}/toggle-status`
    );
  }

  // Shipments
  async createShipment(data: {
    orderId: string;
    courierCompanyId: string;
    weight: number;
    length: number;
    breadth: number;
    height: number;
  }) {
    return this.api.post<ApiResponse<any>>("/admin/shipments/create", data);
  }

  async trackShipment(shipmentId: string) {
    return this.api.get<ApiResponse<any>>(
      `/admin/shipments/${shipmentId}/track`
    );
  }

  async cancelShipment(shipmentId: string) {
    return this.api.post<ApiResponse<void>>(
      `/admin/shipments/${shipmentId}/cancel`
    );
  }

  async getShipmentLabel(shipmentId: string) {
    return this.api.get<ApiResponse<{ labelUrl: string }>>(
      `/admin/shipments/${shipmentId}/label`
    );
  }
}


const adminApiService = new AdminApiService();
export default adminApiService;
