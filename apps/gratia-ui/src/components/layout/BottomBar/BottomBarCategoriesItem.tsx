import { IconColumnsGap } from "@gratia/ui/icons";
import Link from "next/link";
import styles from "./BottomBar.module.scss";

export default function BottomBarCategoriesItem() {
  return (
    <Link href="/products/category" className={styles.bottomBarItemContent}>
      <div className={styles.bottomBarItemIcon}>
        <IconColumnsGap size={20} />
      </div>
      <span className={styles.bottomBarItemLabel}>Categories</span>
    </Link>
  );
}
