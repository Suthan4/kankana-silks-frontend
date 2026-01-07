// store/useAuthModalStore.ts
import { User } from "@/lib/admin/types/auth";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AuthMode = "login" | "register" | "forgot";

interface AuthModalState {
  isOpen: boolean;
  mode: AuthMode;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  openModal: (mode?: AuthMode) => void;
  closeModal: () => void;
  setMode: (mode: AuthMode) => void;
  setAuth: (accessToken: string, user: User) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthModal = create<AuthModalState>()(
  persist(
    (set) => ({
      // Modal state (not persisted)
      isOpen: false,
      mode: "login",

      // Auth state (persisted)
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      // Modal actions
      openModal: (mode = "login") => set({ isOpen: true, mode }),
      closeModal: () => set({ isOpen: false }),
      setMode: (mode) => set({ mode }),

      // Auth actions
      setAuth: (accessToken, user) =>
        set({
          accessToken,
          user,
          isAuthenticated: true,
        }),

      setAccessToken: (accessToken) => set({ accessToken }),

      clearAuth: () => {
        // 1️⃣ clear Zustand state
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
        // 2️⃣ clear persisted storage
        useAuthModal.persist.clearStorage();
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "auth-modal-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist auth-related fields, not modal state
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const authModalStore = {
  openModal: () => useAuthModal.getState().openModal(),
  logout: () => useAuthModal.getState().clearAuth(),
};
