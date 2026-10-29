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
      return value.replace(/^Bearer\\s+/i, "").trim() || null;
    };

    // Always attach the latest access token from the persisted auth store.
    this.api.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        if (token) setAuthorizationHeader(config, token);
        return config;
      },
      (error) => Promise.reject(error),
    );

    // A 401 must actually refresh the session before the original request is
    // rejected. The previous code acquired this mutex but never refreshed or
    // released it, so later 401 responses waited forever and the UI spun.
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

        // A different request may already have refreshed the token while this
        // request was in flight. Retry with that token instead of refreshing again.
        if (
          latestAccessToken &&
          latestAccessToken !== failedWithToken &&
          !originalRequest._freshTokenRetry
        ) {
          originalRequest._freshTokenRetry = true;
          setAuthorizationHeader(originalRequest, latestAccessToken);
          return this.api(originalRequest);
        }

        // Only one refresh attempt per original request. Do not loop forever if
        // the API also returns 401 for the refreshed access token.
        if (originalRequest._retry) {
          this.clearAuthAndRedirect();
          return Promise.reject(error);
        }

        if (refreshMutex.isLocked()) {
          // Another request is refreshing. Wait for it, then retry only if the
          // access token changed; never wait indefinitely on a mutex left locked.
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
          // Another request can finish refreshing while this one is acquiring
          // the mutex, so check again before rotating the refresh token.
          const tokenAfterAcquire = getAccessToken();
          if (
            tokenAfterAcquire &&
            tokenAfterAcquire !== failedWithToken
          ) {
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

          // Save rotated tokens before replaying the original request. Zustand's
          // persist middleware updates local storage as well as in-memory state.
          authModalStore
            .getState()
            .setTokens(newAccessToken, newRefreshToken ?? refreshToken);

          setAuthorizationHeader(originalRequest, newAccessToken);
          return this.api(originalRequest);
        } catch (refreshError) {
          // Invalid/expired refresh token: end the stale session and prompt for
          // sign-in. The original query then settles into its error UI instead
          // of remaining in a permanent loading state.
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
    // Keep refresh recovery independent from the normal API interceptor and
    // bounded in time. A hung refresh request must never leave the shared
    // refresh mutex locked forever.
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
