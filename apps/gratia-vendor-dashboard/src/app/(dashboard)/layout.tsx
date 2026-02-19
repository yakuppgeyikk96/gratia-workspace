"use client";

import classNames from "classnames";
import { SidebarProvider, useSidebar } from "@/components/providers";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import styles from "./dashboard.module.scss";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      <Navbar />
      <main
        className={classNames(styles.mainContent, {
          [styles.sidebarCollapsed]: isCollapsed,
        })}
      >
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
