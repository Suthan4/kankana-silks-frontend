import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCartStore } from "@/store/useCartStore";

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
  showPasswordModal: boolean;
  mode: "login" | "register" | "forgot";
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  openModal: (mode?: "login" | "register" | "forgot") => void;
  closeModal: () => void;
  setMode: (mode: "login" | "register" | "forgot") => void;
  setAuth: (token: string, user: User, refreshToken?: string) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  handlePostLoginRedirect: () => void;
  setShowPasswordModal: (value: boolean) => void;
  togglePasswordModal: () => void;
}

export const authModalStore = create<AuthModalState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      showPasswordModal: false,
      mode: "login",
      user: null,
      accessToken: null,
      refreshToken: null,

      openModal: (mode = "login") => set({ isOpen: true, mode }),

      closeModal: () => set({ isOpen: false }),

      setShowPasswordModal: (value) =>
        set({showPasswordModal:value}),

      togglePasswordModal: () => 
        set((state)=>({
          showPasswordModal:!state.showPasswordModal
        })),

      setMode: (mode) => set({ mode }),

      setAuth: (accessToken, user, refreshToken) => {
        set((state) => ({
          accessToken,
          user,
          refreshToken: refreshToken !== undefined ? (refreshToken || null) : (state.refreshToken ?? null),
        }));

        // Handle post-login redirects after setting auth
        setTimeout(() => {
          get().handlePostLoginRedirect();
        }, 100);
      },

      setTokens: (accessToken, refreshToken) => {
        set((state) => ({
          accessToken,
          refreshToken: refreshToken !== undefined ? (refreshToken || null) : (state.refreshToken ?? null),
        }));
      },

      setUser: (user) => set({ user }),

      /**
       * Handle redirects after successful login
       * This checks for pending actions stored in sessionStorage
       */
      handlePostLoginRedirect: () => {
        // Check if we're in a browser environment
        if (typeof window === "undefined") return;

          // Check for redirect after login
        const redirectAfterLogin = sessionStorage.getItem("redirectAfterLogin");
        if (redirectAfterLogin) {
          sessionStorage.removeItem("redirectAfterLogin");
          set({ isOpen: false });
          window.location.href = redirectAfterLogin;
          return;
        }

        const pendingAction = sessionStorage.getItem("pendingAction");
        const checkoutAfterLogin = sessionStorage.getItem("checkoutAfterLogin");

        // Handle Buy Now action
        if (pendingAction === "buyNow") {
          sessionStorage.removeItem("pendingAction");
          const buyNowData = sessionStorage.getItem("buyNowData");

          if (buyNowData) {
            try {
              const data = JSON.parse(buyNowData);
              
              // Create buy now item in session
              const buyNowItem = {
                productId: data.productId,
                variantId: data.variantId,
                quantity: data.quantity || 1,
                productName: data.productName,
                slug: data.slug,
                price: Number(data.price),
                basePrice: Number(data.basePrice || data.price),
                image: data.image,
                stock: data.stock,
                variant: data.variant,
              };

              sessionStorage.setItem("buyNowItem", JSON.stringify(buyNowItem));
              
              // Close modal
              set({ isOpen: false });

              // Redirect to checkout with buy now mode
              window.location.href = "/checkout?mode=buyNow";
            } catch (error) {
              console.error("Error parsing buyNowData:", error);
              sessionStorage.removeItem("buyNowData");
            }
          }
        }
        // Handle regular checkout redirect
        else if (checkoutAfterLogin === "true") {
          sessionStorage.removeItem("checkoutAfterLogin");
          
          // Close modal
          set({ isOpen: false });

          // Redirect to checkout
          window.location.href = "/checkout";
        }
      },

      logout: () => {
        // Clear auth state and any in-memory guest cart from the previous session.
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        });

        useCartStore.setState({ items: [], appliedCoupon: null });

        if (typeof window !== "undefined") {
          // Zustand persist writes after setState; remove the key afterwards so
          // the next guest session starts with a genuinely empty cart.
          localStorage.removeItem("cart-storage");
          localStorage.removeItem("auth-modal-storage");

          sessionStorage.removeItem("pendingAction");
          sessionStorage.removeItem("buyNowData");
          sessionStorage.removeItem("buyNowItem");
          sessionStorage.removeItem("checkoutAfterLogin");
          sessionStorage.removeItem("redirectAfterLogin");
        }
      },
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