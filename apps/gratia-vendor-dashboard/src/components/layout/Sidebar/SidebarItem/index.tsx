"use client";

import classNames from "classnames";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ISidebarItem } from "@/types";
import styles from "./SidebarItem.module.scss";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
};

interface SidebarItemProps {
  item: ISidebarItem;
  isCollapsed: boolean;
  isActive: boolean;
}

export default function SidebarItem({
  item,
  isCollapsed,
  isActive,
}: SidebarItemProps) {
  const Icon = ICON_MAP[item.iconName];

  return (
    <li>
      <Link
        href={item.href}
        className={classNames(styles.sidebarItem, {
          [styles.active]: isActive,
          [styles.collapsed]: isCollapsed,
        })}
        title={item.label}
      >
        <span className={styles.iconWrapper}>
          {Icon ? <Icon size={20} /> : null}
        </span>
        {!isCollapsed && <span className={styles.label}>{item.label}</span>}
      </Link>
    </li>
  );
}
