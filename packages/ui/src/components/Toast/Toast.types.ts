import type { ReactNode } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastSwipeDirection = "up" | "down" | "left" | "right";

export interface ToastProps {
  title?: string;
  description: string;
  variant: ToastVariant;
  duration?: number;
  action?: ReactNode;
  onClose?: () => void;
}
