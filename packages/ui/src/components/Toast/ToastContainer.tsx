"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useToastContext } from "./ToastContext";
import type { ToastListProps } from "./ToastList";

export default function ToastContainer() {
  const { toasts, removeToast, swipeDirection } = useToastContext();
  const [ToastList, setToastList] =
    useState<ComponentType<ToastListProps> | null>(null);

  const hasToasts = toasts.length > 0;

  // Radix Toast is only needed once something is shown, so keep it out of the
  // initial bundle and load it with the first toast.
  useEffect(() => {
    if (!hasToasts || ToastList) return;

    let cancelled = false;

    import("./ToastList")
      .then((module) => {
        if (!cancelled) setToastList(() => module.default);
      })
      .catch((error: unknown) => {
        console.error("Failed to load toast UI", error);
      });

    return () => {
      cancelled = true;
    };
  }, [hasToasts, ToastList]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    toasts.forEach((toast) => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, removeToast]);

  if (!ToastList) return null;

  return (
    <ToastList
      toasts={toasts}
      swipeDirection={swipeDirection}
      onRemove={removeToast}
    />
  );
}
