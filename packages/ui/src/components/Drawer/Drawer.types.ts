import { ReactNode } from "react";

export interface DrawerItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  children?: DrawerItem[];
  badge?: number;
  disabled?: boolean;
}

export interface DrawerProps {
  trigger: ReactNode;
  items: DrawerItem[];
  title?: string;
  position?: "left" | "right";
  onClose?: () => void;
}

export interface DrawerNavigationState {
  currentLevel: DrawerItem[];
  history: DrawerItem[][];
  title: string;
}
