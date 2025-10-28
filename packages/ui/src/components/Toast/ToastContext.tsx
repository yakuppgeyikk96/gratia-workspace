"use client";

import { createContext, ReactNode, useContext } from "react";
import { ToastProvider as RadixToastProvider } from "./index";
import { ToastMessage, useToast } from "./useToast";

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
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
  swipeDirection?: "up" | "down" | "left" | "right";
}

export function ToastProvider({
  children,
  swipeDirection = "right",
}: ToastProviderProps) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      <RadixToastProvider swipeDirection={swipeDirection}>
        {children}
      </RadixToastProvider>
    </ToastContext.Provider>
  );
}
