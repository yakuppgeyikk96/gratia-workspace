"use client";

import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR_ITEMS } from "@/constants";
import { useSidebar } from "@/components/providers";
import SidebarItem from "./SidebarItem";
import styles from "./Sidebar.module.scss";

export default function Sidebar() {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      className={classNames(styles.sidebar, {
        [styles.collapsed]: isCollapsed,
      })}
    >
      <div className={styles.logoArea}>
        <Link href="/" className={styles.logoLink}>
          {isCollapsed ? (
            <span className={styles.logoIcon}>G</span>
          ) : (
            <span className={styles.logoText}>Gratia Vendor</span>
          )}
        </Link>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {SIDEBAR_ITEMS.map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              isCollapsed={isCollapsed}
              isActive={pathname === item.href}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
