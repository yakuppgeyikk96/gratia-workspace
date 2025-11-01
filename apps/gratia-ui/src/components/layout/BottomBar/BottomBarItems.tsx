"use client";

import { BottomBarItem } from "@/types/Navigation.types";
import { useMemo } from "react";
import styles from "./BottomBar.module.scss";
import BottomBarCartItem from "./BottomBarCartItem";
import BottomBarCategoriesItem from "./BottomBarCategoriesItem";
import BottomBarHomeItem from "./BottomBarHomeItem";
import BottomBarProfileItem from "./BottomBarProfileItem";

interface BottomBarItemsProps {
  isAuthenticated: boolean;
}

export default function BottomBarItems(props: BottomBarItemsProps) {
  const items: BottomBarItem[] = useMemo(
    () => [
      {
        id: "home",
        label: <BottomBarHomeItem />,
      },
      {
        id: "categories",
        label: <BottomBarCategoriesItem />,
      },
      {
        id: "cart",
        label: <BottomBarCartItem />,
      },
      {
        id: "profile",
        label: <BottomBarProfileItem isAuthenticated={props.isAuthenticated} />,
      },
    ],
    [props.isAuthenticated]
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
