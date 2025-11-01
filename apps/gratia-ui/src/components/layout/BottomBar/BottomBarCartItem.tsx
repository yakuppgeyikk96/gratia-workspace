import { Badge } from "@gratia/ui/components";
import { IconShoppingBag } from "@gratia/ui/icons";
import Link from "next/link";
import styles from "./BottomBar.module.scss";

export default function BottomBarCartItem() {
  return (
    <Link href="/cart" className={styles.bottomBarItemContent}>
      <div className={styles.bottomBarItemIcon}>
        <IconShoppingBag size={20} />
        <Badge
          count={0}
          size="sm"
          color="secondary"
          className={styles.bottomBarItemBadge}
        />
      </div>
      <span className={styles.bottomBarItemLabel}>Cart</span>
    </Link>
  );
}
