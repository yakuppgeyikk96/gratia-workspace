"use client";

import { BottomBarItem } from "@/types";
import { Badge } from "@gratia/ui/components";
import {
  IconColumnsGap,
  IconHome,
  IconPerson,
  IconShoppingBag,
} from "@gratia/ui/icons";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import styles from "./BottomBar.module.scss";

export default function BottomBar() {
  const router = useRouter();

  const items: BottomBarItem[] = useMemo(
    () => [
      {
        id: "home",
        label: "Home",
        icon: <IconHome size={20} />,
        href: "/",
      },
      {
        id: "categories",
        label: "Categories",
        icon: <IconColumnsGap size={20} />,
        href: "/products/category",
      },
      {
        id: "cart",
        label: "Cart",
        icon: <IconShoppingBag size={20} />,
        href: "/cart",
        badge: 3,
      },
      {
        id: "profile",
        label: "Profile",
        icon: <IconPerson size={20} />,
        href: "/profile",
      },
    ],
    []
  );

  const handleItemClick = (href: string) => {
    router.push(href);
  };

  return (
    <nav className={styles.bottomBar}>
      <div className={styles.bottomBarInner}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.href)}
            className={styles.bottomBarItem}
            aria-label={item.label}
          >
            <div className={styles.bottomBarItemIcon}>
              {item.icon}
              {item.badge && item.badge > 0 && (
                <Badge
                  count={item.badge}
                  size="sm"
                  color="secondary"
                  className={styles.bottomBarItemBadge}
                />
              )}
            </div>
            <span className={styles.bottomBarItemLabel}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
