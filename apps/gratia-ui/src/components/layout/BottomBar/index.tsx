"use client";

import { BottomBarItem } from "@/types";
import { Badge, Drawer, DrawerItem } from "@gratia/ui/components";
import {
  IconColumnsGap,
  IconHome,
  IconPerson,
  IconShoppingBag,
} from "@gratia/ui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import styles from "./BottomBar.module.scss";

export default function BottomBar() {
  const router = useRouter();

  const profileItems: DrawerItem[] = useMemo(
    () => [
      {
        id: "preferences",
        label: "Preferences",
        children: [
          {
            id: "language",
            label: "Language",
            icon: "🌍",
            children: [
              {
                id: "language-en",
                label: "English",
                onClick: () => console.log("Open language selector"),
              },
              {
                id: "language-tr",
                label: "Turkish",
                onClick: () => console.log("Open language selector"),
              },
            ],
          },
          {
            id: "currency",
            label: "Currency",
            icon: "💰",
            onClick: () => console.log("Open currency selector"),
          },
        ],
      },
      {
        id: "orders",
        label: "My Orders",
        icon: "📦",
        onClick: () => router.push("/profile/orders"),
      },
      {
        id: "wishlist",
        label: "Wishlist",
        icon: "❤️",
        onClick: () => router.push("/wishlist"),
      },
      {
        id: "logout",
        label: "Logout",
        icon: "🚪",
        onClick: () => console.log("Logout"),
      },
    ],
    []
  );

  const items: BottomBarItem[] = useMemo(
    () => [
      {
        id: "home",
        label: (
          <Link href="/" className={styles.bottomBarItemContent}>
            <div className={styles.bottomBarItemIcon}>
              <IconHome size={20} />
            </div>
            <span className={styles.bottomBarItemLabel}>Home</span>
          </Link>
        ),
      },
      {
        id: "categories",
        label: (
          <Link
            href="/products/category"
            className={styles.bottomBarItemContent}
          >
            <div className={styles.bottomBarItemIcon}>
              <IconColumnsGap size={20} />
            </div>
            <span className={styles.bottomBarItemLabel}>Categories</span>
          </Link>
        ),
      },
      {
        id: "cart",
        label: (
          <Link href="/cart" className={styles.bottomBarItemContent}>
            <div className={styles.bottomBarItemIcon}>
              <IconShoppingBag size={20} />
              <Badge
                count={3}
                size="sm"
                color="secondary"
                className={styles.bottomBarItemBadge}
              />
            </div>
            <span className={styles.bottomBarItemLabel}>Cart</span>
          </Link>
        ),
      },
      {
        id: "profile",
        label: (
          <Drawer
            trigger={
              <div className={styles.bottomBarItemContent}>
                <div className={styles.bottomBarItemIcon}>
                  <IconPerson size={20} />
                </div>
                <span className={styles.bottomBarItemLabel}>Profile</span>
              </div>
            }
            items={profileItems}
            title="Profile"
            position="right"
          />
        ),
      },
    ],
    []
  );

  return (
    <nav className={styles.bottomBar}>
      <div className={styles.bottomBarInner}>
        {items.map((item) =>
          item.onClick ? (
            <button
              key={item.id}
              onClick={item.onClick}
              className={styles.bottomBarItem}
              aria-label={item.id}
            >
              {item.label}
            </button>
          ) : (
            <div key={item.id} className={styles.bottomBarItem}>
              {item.label}
            </div>
          )
        )}
      </div>
    </nav>
  );
}
