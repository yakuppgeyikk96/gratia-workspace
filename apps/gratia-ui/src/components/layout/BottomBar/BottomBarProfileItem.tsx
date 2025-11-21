import { logoutUser } from "@/actions";
import { Drawer, DrawerItem } from "@gratia/ui/components";
import {
  IconBox,
  IconBoxArrowLeft,
  IconBoxArrowRight,
  IconCash,
  IconHeart,
  IconPerson,
  IconTranslate,
} from "@gratia/ui/icons";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import styles from "./BottomBar.module.scss";

interface BottomBarProfileItemProps {
  isLoggedIn: boolean;
}

export default function BottomBarProfileItem(props: BottomBarProfileItemProps) {
  const router = useRouter();

  const handleLogout = useCallback(() => {
    logoutUser();
    router.refresh();
  }, [router]);

  const profileItems: DrawerItem[] = useMemo(() => {
    const items: DrawerItem[] = [];

    if (props.isLoggedIn) {
      items.push(
        ...[
          {
            id: "orders",
            label: "My Orders",
            icon: <IconBox />,
            onClick: () => router.push("/profile/orders"),
          },
          {
            id: "wishlist",
            label: "Wishlist",
            icon: <IconHeart />,
            onClick: () => router.push("/wishlist"),
          },
        ]
      );
    }

    items.push(
      ...[
        {
          id: "language",
          label: "Language",
          icon: <IconTranslate />,
          children: [
            {
              id: "language-en",
              label: "English",
              icon: "🇺🇸",
              onClick: () => console.log("Open language selector"),
            },
            {
              id: "language-tr",
              label: "Turkish",
              icon: "🇹🇷",
              onClick: () => console.log("Open language selector"),
            },
          ],
        },
        {
          id: "currency",
          label: "Currency",
          icon: <IconCash />,
          children: [
            {
              id: "currency-usd",
              label: "USD",
              icon: "$",
              onClick: () => console.log("Open currency selector"),
            },
            {
              id: "currency-tr",
              label: "TR",
              icon: "₺",
              onClick: () => console.log("Open currency selector"),
            },
          ],
        },
      ]
    );

    if (props.isLoggedIn) {
      items.push({
        id: "logout",
        label: "Logout",
        icon: <IconBoxArrowLeft />,
        onClick: handleLogout,
      });
    } else {
      items.push({
        id: "login",
        label: "Login",
        icon: <IconBoxArrowRight />,
        onClick: () => router.push("/login"),
      });
    }

    return items;
  }, [props.isLoggedIn, handleLogout, router]);

  return (
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
  );
}
