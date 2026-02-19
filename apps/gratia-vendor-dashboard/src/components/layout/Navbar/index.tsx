"use client";

import classNames from "classnames";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/providers";
import styles from "./Navbar.module.scss";

export default function Navbar() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <header
      className={classNames(styles.navbar, {
        [styles.sidebarCollapsed]: isCollapsed,
      })}
    >
      <div className={styles.leftSection}>
        <button
          className={styles.toggleButton}
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          type="button"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className={styles.rightSection}>
        <span className={styles.placeholder}>Vendor Panel</span>
      </div>
    </header>
  );
}
