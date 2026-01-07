export type UserRole = "SUPERADMIN" | "ADMIN" | "USER";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

export interface Permission {
  module: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type ModuleName =
  | "products"
  | "categories"
  | "orders"
  | "warehouses"
  | "consultations"
  | "banners"
  | "coupons"
  | "home_sections"
  | "users";

export type PermissionAction =
  | "canCreate"
  | "canRead"
  | "canUpdate"
  | "canDelete";
