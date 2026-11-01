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
    const setAuthorizationHeader = (request: any, token: string) => {
      if (!request.headers) request.headers = {} as any;
      if (typeof request.headers.set === "function") {
        request.headers.set("Authorization", `Bearer ${token}`);
      } else {
        request.headers.Authorization = `Bearer ${token}`;
      }
    };

    const getRequestToken = (request: any): string | null => {
      const value =
        request?.headers?.get?.("Authorization") ??
        request?.headers?.Authorization ??
        request?.headers?.authorization;
      if (typeof value !== "string") return null;
      return value.replace(/^Bearer\s+/i, "").trim() || null;
    };

    // Always attach the latest access token from persisted auth state.
    this.api.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        if (token) setAuthorizationHeader(config, token);
        return config;
      },
      (error) => Promise.reject(error),
    );

    // On 401, refresh once and retry the failed API request. Always release the
    // mutex: without this, a failed request could lock every subsequent API call.
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (
          error.response?.status !== 401 ||
          !originalRequest ||
          isAuthEndpoint(originalRequest.url)
        ) {
          return Promise.reject(error);
        }

        const failedWithToken = getRequestToken(originalRequest);
        const latestAccessToken = getAccessToken();

        // Another request may already have refreshed the token while this one
        // was in flight, so reuse that token rather than rotate twice.
        if (
          latestAccessToken &&
          latestAccessToken !== failedWithToken &&
          !originalRequest._freshTokenRetry
        ) {
          originalRequest._freshTokenRetry = true;
          setAuthorizationHeader(originalRequest, latestAccessToken);
          return this.api(originalRequest);
        }

        if (originalRequest._retry || originalRequest._freshTokenRetry) {
          this.clearAuthAndRedirect();
          return Promise.reject(error);
        }

        if (refreshMutex.isLocked()) {
          await refreshMutex.waitForUnlock();

          const tokenAfterRefresh = getAccessToken();
          if (tokenAfterRefresh && tokenAfterRefresh !== failedWithToken) {
            originalRequest._freshTokenRetry = true;
            setAuthorizationHeader(originalRequest, tokenAfterRefresh);
            return this.api(originalRequest);
          }

          if (!getRefreshToken()) this.clearAuthAndRedirect();
          return Promise.reject(error);
        }

        originalRequest._retry = true;
        const release = await refreshMutex.acquire();

        try {
          // Recheck after acquiring the lock in case another request refreshed
          // the token immediately before we acquired it.
          const tokenAfterAcquire = getAccessToken();
          if (tokenAfterAcquire && tokenAfterAcquire !== failedWithToken) {
            originalRequest._freshTokenRetry = true;
            setAuthorizationHeader(originalRequest, tokenAfterAcquire);
            return this.api(originalRequest);
          }

          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            this.clearAuthAndRedirect();
            return Promise.reject(error);
          }

          const refreshResponse = await this.refreshToken(refreshToken);
          const tokenPayload = refreshResponse?.data?.data;
          const newAccessToken = tokenPayload?.accessToken;
          const newRefreshToken = tokenPayload?.refreshToken;

          if (!newAccessToken || typeof newAccessToken !== "string") {
            throw new Error("Session refresh did not return a valid access token.");
          }

          authModalStore
            .getState()
            .setTokens(newAccessToken, newRefreshToken ?? refreshToken);

          setAuthorizationHeader(originalRequest, newAccessToken);
          return this.api(originalRequest);
        } catch (refreshError) {
          this.clearAuthAndRedirect();
          return Promise.reject(refreshError);
        } finally {
          release();
        }
      },
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
    // Use an independent, bounded request so the refresh flow does not depend
    // on the normal API interceptor and can never hold the mutex indefinitely.
    const baseUrl = getApiBaseUrl();
    return axios.post(
      `${baseUrl}/auth/refresh-token`,
      { refreshToken },
      {
        timeout: 10_000,
        headers: { "Content-Type": "application/json" },
      },
    );
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
