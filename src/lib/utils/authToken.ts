export function getAccessToken(): string | null {
  try {
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
    const raw = localStorage.getItem("auth-modal-storage");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed?.state?.refreshToken ?? null;
  } catch {
    return null;
  }
}
