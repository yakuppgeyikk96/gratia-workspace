import { IconHome } from "@gratia/ui/icons";
import Link from "next/link";
import styles from "./BottomBar.module.scss";

export default function BottomBarHomeItem() {
  return (
    <Link href="/" className={styles.bottomBarItemContent}>
      <div className={styles.bottomBarItemIcon}>
        <IconHome size={20} />
      </div>
      <span className={styles.bottomBarItemLabel}>Home</span>
    </Link>
  );
}
