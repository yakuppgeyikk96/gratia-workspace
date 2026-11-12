"use client";

import { Toast, ToastProvider } from "./Toast";
import type { ToastSwipeDirection } from "./Toast.types";
import type { ToastMessage } from "./useToast";

export interface ToastListProps {
  toasts: ToastMessage[];
  swipeDirection: ToastSwipeDirection;
  onRemove: (id: string) => void;
}

/**
 * The Radix-backed toast viewport and its toasts. Loaded on demand by
 * `ToastContainer` the first time a toast is shown.
 */
export default function ToastList({
  toasts,
  swipeDirection,
  onRemove,
}: ToastListProps) {
  return (
    <ToastProvider swipeDirection={swipeDirection}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          duration={toast.duration}
          action={toast.action}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </ToastProvider>
  );
}
