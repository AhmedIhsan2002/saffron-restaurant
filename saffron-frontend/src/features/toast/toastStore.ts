import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, type?: ToastType, duration?: number) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  show: (message, type = "info", duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set({ toasts: [...get().toasts, { id, message, type, duration }] });

    // إزالة تلقائية
    setTimeout(() => get().remove(id), duration);
  },

  remove: (id) =>
    set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));