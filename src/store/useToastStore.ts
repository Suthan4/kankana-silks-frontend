import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration: number;

  timeoutId?: ReturnType<typeof setTimeout>;
  startTime?: number;
  remaining?: number;
};

type ToastOptions = {
  type?: ToastType;
  duration?: number;
};

type ToastStore = {
  toasts: Toast[];
  showToast: (message: string, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
  pauseToast: (id: string) => void;
  resumeToast: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  showToast: (message, options) => {
    const id = crypto.randomUUID();
    const duration = options?.duration ?? 3000;

    const startTime = Date.now();

    const timeoutId = setTimeout(() => {
      get().removeToast(id);
    }, duration);

    const toast: Toast = {
      id,
      message,
      type: options?.type ?? "success",
      duration,
      startTime,
      remaining: duration,
      timeoutId,
    };

    set((state) => ({ toasts: [...state.toasts, toast] }));
  },

  pauseToast: (id) => {
    const toast = get().toasts.find((t) => t.id === id);
    if (!toast || !toast.timeoutId) return;

    clearTimeout(toast.timeoutId);

    const elapsed = Date.now() - (toast.startTime ?? 0);
    toast.remaining = Math.max(toast.duration - elapsed, 0);
    toast.timeoutId = undefined;

    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...toast } : t)),
    }));
  },

  resumeToast: (id) => {
    const toast = get().toasts.find((t) => t.id === id);
    if (!toast || toast.remaining === undefined) return;

    toast.startTime = Date.now();
    toast.timeoutId = setTimeout(() => {
      get().removeToast(id);
    }, toast.remaining);

    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...toast } : t)),
    }));
  },

  removeToast: (id) => {
    const toast = get().toasts.find((t) => t.id === id);
    if (toast?.timeoutId) clearTimeout(toast.timeoutId);

    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

/* ✅ Non-hook API remains unchanged */
export const toast = {
  success: (msg: string, duration?: number) =>
    useToastStore.getState().showToast(msg, { type: "success", duration }),
  error: (msg: string, duration?: number) =>
    useToastStore.getState().showToast(msg, { type: "error", duration }),
  info: (msg: string, duration?: number) =>
    useToastStore.getState().showToast(msg, { type: "info", duration }),
  warning: (msg: string, duration?: number) =>
    useToastStore.getState().showToast(msg, { type: "warning", duration }),
};
