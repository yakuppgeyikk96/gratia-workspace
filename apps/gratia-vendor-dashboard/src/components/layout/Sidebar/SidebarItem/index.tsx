"use client";

import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Package, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ISidebarItem } from "@/types";
import styles from "./SidebarItem.module.scss";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  List,
  Package,
  Plus,
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
  const pathname = usePathname();
  const Icon = ICON_MAP[item.iconName];
  const hasChildren = item.children && item.children.length > 0;

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
      {hasChildren && !isCollapsed && (
        <ul className={styles.childList}>
          {item.children!.map((child) => {
            const ChildIcon = ICON_MAP[child.iconName];
            const isChildActive = pathname === child.href;

            return (
              <li key={child.key}>
                <Link
                  href={child.href}
                  className={classNames(styles.childItem, {
                    [styles.active]: isChildActive,
                  })}
                  title={child.label}
                >
                  <span className={styles.childIconWrapper}>
                    {ChildIcon ? <ChildIcon size={16} /> : null}
                  </span>
                  <span className={styles.childLabel}>{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
