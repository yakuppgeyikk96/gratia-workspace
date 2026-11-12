import { ReactElement, ReactNode } from "react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string | ReactNode;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  triggerClassName?: string;
  contentClassName?: string;
  icon?: ReactNode;
  /**
   * Replaces the default trigger button. Must be a single element that
   * forwards the props it receives (event handlers, aria attributes, ref).
   */
  customTrigger?: ReactElement<Record<string, unknown>>;
}
