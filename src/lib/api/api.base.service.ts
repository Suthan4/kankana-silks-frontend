import axios, { AxiosInstance, AxiosError } from "axios";
import { AuthTokens } from "@/lib/admin/types/auth";
import { ApiResponse } from "@/lib/admin/types/api";

const API_BASE_URL = "http://localhost:3000/api";

export class BaseApiService {
  protected api: AxiosInstance;
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

            const response = await axios.post<ApiResponse<AuthTokens>>(
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
    return this.api.post<
      ApiResponse<{
        accessToken: string;
        user: any;
      }>
    >("/auth/login", credentials);
  }
  async forgotPassword(credentials: { email: string }) {
    return this.api.post("/auth/forgot-password", credentials);
  }

  async logout() {
    return this.api.post("/auth/logout");
  }

  async getProfile() {
    return this.api.get<ApiResponse<any>>("/auth/me");
  }

  async refreshToken(refreshToken: string) {
    return this.api.post<ApiResponse<AuthTokens>>("/auth/refresh-token", {
      refreshToken,
    });
  }
}
