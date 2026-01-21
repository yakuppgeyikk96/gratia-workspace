"use client";

import { BottomBarItem } from "@/types/Navigation.types";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import BottomBarCartItem from "./BottomBarCartItem";
import BottomBarCategoriesItem from "./BottomBarCategoriesItem";
import BottomBarHomeItem from "./BottomBarHomeItem";
import BottomBarProfileItem from "./BottomBarProfileItem";

import styles from "./BottomBarItems.module.scss";

interface BottomBarItemsProps {
  isLoggedIn: boolean;
}

export default function BottomBarItems(props: BottomBarItemsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        label: <BottomBarProfileItem isLoggedIn={props.isLoggedIn} />,
      },
    ],
    [props.isLoggedIn]
  );

  const bottomBarContent = (
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

  // Render to body using portal to ensure fixed positioning works
  if (!mounted) {
    return null;
  }

  return createPortal(bottomBarContent, document.body);
}
