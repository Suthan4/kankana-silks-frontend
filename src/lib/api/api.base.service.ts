import { authModalStore } from "@/store/useAuthModalStore";
import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export type UserRole = "SUPERADMIN" | "ADMIN" | "USER";
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

export class BaseApiService {
  public api: AxiosInstance;
  private onAuthFailure: () => void;

  constructor(onAuthFailure: () => void) {
    this.onAuthFailure = onAuthFailure;
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
              throw new Error("No refresh token");
            }

            const response = await axios.post(
              `${API_BASE_URL}/auth/refresh-token`,
              { refreshToken }
            );

            const { accessToken } = response.data.data;
            console.log("response.data.data", response.data.data);

            localStorage.setItem("accessToken", accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.clearAuthAndRedirect();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private clearAuthAndRedirect() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    this.onAuthFailure();
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) {
    return this.api.post("/auth/register", data);
  }

  // Shared auth methods
  async login(credentials: { email: string; password: string }) {
    return this.api.post("/auth/login", credentials);
  }
  async forgotPassword(credentials: { email: string }) {
    return this.api.post("/auth/forgot-password", credentials);
  }

  async logout() {
    return this.api.post("/auth/logout");
  }

  async getProfile() {
    return this.api.get("/auth/me");
  }

  async refreshToken(refreshToken: string) {
    return this.api.post("/auth/refresh-token", {
      refreshToken,
    });
  }
}
export const authService = new BaseApiService(() => {
  // Centralized auth failure handling
  console.log("Auth failed. Redirecting to login...");
  authModalStore.openModal();
  // or router.push("/login")
});
