import type { ReactNode } from "react";

export interface CollapsibleProps {
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled default open state */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Trigger content (label or custom ReactNode). Rendered inside the clickable trigger with a chevron. */
  trigger: ReactNode;
  /** Collapsible content (shown when open) */
  children: ReactNode;
  /** Whether the collapsible is disabled */
  disabled?: boolean;
  /** Optional class name for the root element */
  className?: string;
}
