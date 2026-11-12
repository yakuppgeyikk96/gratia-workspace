"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import type { ToastSwipeDirection } from "./Toast.types";
import { ToastMessage, useToast } from "./useToast";

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  swipeDirection: ToastSwipeDirection;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  swipeDirection?: ToastSwipeDirection;
}

/**
 * Holds toast state only. The Radix toast UI is rendered by `ToastContainer`,
 * which loads it on demand, so wrapping the app in this provider does not pull
 * Radix into the initial bundle.
 */
export function ToastProvider({
  children,
  swipeDirection = "right",
}: ToastProviderProps) {
  const { toasts, addToast, removeToast, clearAllToasts } = useToast();

  const value = useMemo(
    () => ({ toasts, addToast, removeToast, clearAllToasts, swipeDirection }),
    [toasts, addToast, removeToast, clearAllToasts, swipeDirection],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
