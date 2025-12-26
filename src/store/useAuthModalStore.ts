import { create } from "zustand";

type AuthMode = "login" | "register" | "forgot";

interface AuthModalState {
  isOpen: boolean;
  mode: AuthMode;
  openModal: (mode?: AuthMode) => void;
  closeModal: () => void;
  setMode: (mode: AuthMode) => void;
}

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: "login",
  openModal: (mode = "login") => set({ isOpen: true, mode }),
  closeModal: () => set({ isOpen: false }),
  setMode: (mode) => set({ mode }),
}));
