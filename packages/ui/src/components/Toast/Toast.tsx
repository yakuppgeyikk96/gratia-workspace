"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import * as React from "react";
import { IconCross } from "../../icons";
import Flex from "../Flex";
import styles from "./Toast.module.scss";
import type { ToastProps } from "./Toast.types";

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps & React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
>(
  (
    {
      title,
      description,
      variant = "info",
      duration = 5000,
      action,
      onClose,
      ...props
    },
    ref,
  ) => {
    return (
      <ToastPrimitive.Root
        ref={ref}
        className={`${styles.toast} ${styles[`toast--${variant}`]}`}
        duration={duration}
        onOpenChange={(open) => !open && onClose?.()}
        {...props}
      >
        <div className={styles.toastContent}>
          <div className={styles.toastBody}>
            {title && (
              <ToastPrimitive.Title className={styles.toastTitle}>
                {title}
              </ToastPrimitive.Title>
            )}
            <ToastPrimitive.Description className={styles.toastDescription}>
              {description}
            </ToastPrimitive.Description>
          </div>

          <Flex align="center" gap={8}>
            {action && (
              <ToastPrimitive.Action asChild altText="Action">
                {action}
              </ToastPrimitive.Action>
            )}
            <ToastPrimitive.Close
              className={styles.toastClose}
              aria-label="Close"
            >
              <IconCross size={16} />
            </ToastPrimitive.Close>
          </Flex>
        </div>
      </ToastPrimitive.Root>
    );
  },
);

Toast.displayName = "Toast";

interface ToastProviderProps {
  children: React.ReactNode;
  swipeDirection?: "up" | "down" | "left" | "right";
}

const ToastProvider = ({
  children,
  swipeDirection = "right",
}: ToastProviderProps) => (
  <ToastPrimitive.Provider swipeDirection={swipeDirection}>
    {children}
    <ToastPrimitive.Viewport className={styles.toastViewport} />
  </ToastPrimitive.Provider>
);

export { Toast, ToastProvider };
