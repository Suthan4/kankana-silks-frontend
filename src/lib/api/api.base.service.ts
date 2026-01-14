import { authModalStore } from "@/store/useAuthModalStore";
import axios, { AxiosInstance, AxiosError } from "axios";
import { getAccessToken, getRefreshToken } from "../utils/authToken";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||  "http://localhost:3000/api";

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
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

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

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = getAccessToken();

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
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.api(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = getRefreshToken();

            if (!refreshToken) {
              throw new Error("No refresh token");
            }

            const response = await axios.post(
              `${API_BASE_URL}/auth/refresh-token`,
              { refreshToken }
            );

            const { accessToken } = response.data.data;

            // Update Zustand store properly
            const authState = authModalStore.getState();
            authState.setAuth(accessToken, authState.user!);

            this.processQueue(null, accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.clearAuthAndRedirect();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private clearAuthAndRedirect() {
    // Clear all auth data
    authModalStore.getState().logout();
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
  async resetPassword(token: string, password: string) {
    return this.api.post("/auth/reset-password", {
      token,
      password,
    });
  }
}

export const authService = new BaseApiService(() => {
  // Centralized auth failure handling
  console.log("Auth failed. Redirecting to login...");
  authModalStore.getState().openModal();
});
