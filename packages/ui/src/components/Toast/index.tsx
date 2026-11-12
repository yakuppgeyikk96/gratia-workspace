"use client";

// Only the Radix-free pieces are exported here. The Radix-backed `Toast` and
// `ToastProvider` live in `./Toast` and are loaded on demand by
// `ToastContainer`; re-exporting them from this entry would pull Radix back
// into the initial bundle of every app that renders the context provider.
export { default as ToastContainer } from "./ToastContainer";
export {
  ToastProvider as ToastContextProvider,
  useToastContext,
} from "./ToastContext";
export type { ToastProps, ToastVariant } from "./Toast.types";
