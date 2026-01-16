import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "SUPERADMIN" | "ADMIN" | "USER";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

interface AuthModalState {
  isOpen: boolean;
  mode: "login" | "register" | "forgot";
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  openModal: (mode?: "login" | "register" | "forgot") => void;
  closeModal: () => void;
  setMode: (mode: "login" | "register" | "forgot") => void;
  setAuth: (token: string, user: User, refreshToken?: string) => void;
  logout: () => void;
}

export const authModalStore = create<AuthModalState>()(
  persist(
    (set) => ({
      isOpen: false,
      mode: "login",
      user: null,
      accessToken: null,
      refreshToken: null,

      openModal: (mode = "login") => set({ isOpen: true, mode }),

      closeModal: () => set({ isOpen: false }),

      setMode: (mode) => set({ mode }),

      setAuth: (accessToken, user, refreshToken) =>
        set({
          accessToken,
          user,
          refreshToken: refreshToken || undefined,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        }),
    }),
    {
      name: "auth-modal-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

export const useAuthModal = authModalStore;
