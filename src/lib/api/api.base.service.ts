import { authModalStore } from "@/store/useAuthModalStore";
import axios, { AxiosInstance, AxiosError } from "axios";
import { Mutex } from "async-mutex";
import { getAccessToken, getRefreshToken } from "../utils/authToken";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getApiBaseUrl = (): string => {
  const url = API_BASE_URL || "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

// Shared mutex across all BaseApiService instances to prevent duplicate concurrent refresh requests
const refreshMutex = new Mutex();

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/refresh-token") ||
    url.includes("/auth/register") ||
    url.includes("/auth/forgot-password") ||
    url.includes("/auth/reset-password")
  );
};

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
        const token = getAccessToken();

        if (token) {
          if (!config.headers) {
            config.headers = {} as any;
          }
          config.headers.Authorization = `Bearer ${token}`;
          if (typeof config.headers.set === "function") {
            config.headers.set("Authorization", `Bearer ${token}`);
          }
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

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !isAuthEndpoint(originalRequest.url)
        ) {
          originalRequest._retry = true;

          // If another request is already refreshing, wait for it to complete
          if (refreshMutex.isLocked()) {
            await refreshMutex.waitForUnlock();

            const refreshedToken = getAccessToken();
            if (refreshedToken) {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
                if (typeof originalRequest.headers.set === "function") {
                  originalRequest.headers.set(
                    "Authorization",
                    `Bearer ${refreshedToken}`
                  );
                }
              }
              return this.api(originalRequest);
            }

            return Promise.reject(error);
          }

          // Acquire the mutex for the single refresh-token operation
          const release = await refreshMutex.acquire();
        }

        return Promise.reject(error);
      }
    );
  }

  private clearAuthAndRedirect() {
    // Clear all auth data
    const { user } = authModalStore.getState();

    authModalStore.getState().logout();

    // ✅ Only trigger modal if user was actually logged in before
    if (user) {
      this.onAuthFailure();
    }
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    termsAccepted:boolean;
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
    // NEW: Update Profile
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  }) {
    return this.api.put("/auth/profile", data);
  }
  // NEW: Change Password
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.api.put("/auth/change-password", data);
  }
}

export const authService = new BaseApiService(() => {
  // Centralized auth failure handling
  console.log("Auth failed. Redirecting to login...");
  authModalStore.getState().openModal();
});
