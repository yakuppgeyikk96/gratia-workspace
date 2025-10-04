import { ReactNode } from "react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string | ReactNode;
}

export interface BaseDropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}

export interface DropdownProps extends BaseDropdownProps {
  triggerClassName?: string;
  contentClassName?: string;
  icon?: ReactNode;
  customTrigger?: ReactNode;
}
