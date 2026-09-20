import { authModalStore } from "@/store/useAuthModalStore";

export function getAccessToken(): string | null {
  try {
    const storeToken = authModalStore.getState().accessToken;
    if (storeToken) return storeToken;

    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("auth-modal-storage");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    const storeRefreshToken = authModalStore.getState().refreshToken;
    if (storeRefreshToken) return storeRefreshToken;

    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("auth-modal-storage");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed?.state?.refreshToken ?? null;
  } catch {
    return null;
  }
}
