"use client";

import { useEffect } from "react";
import { Toast, useToastContext } from "../index";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastContext();

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts, removeToast]);

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          duration={toast.duration}
          action={toast.action}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
