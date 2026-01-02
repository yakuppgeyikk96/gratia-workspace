import IconHome from "@gratia/ui/icons/IconHome";
import Link from "next/link";
import styles from "./BottomBarItems.module.scss";

export default function BottomBarHomeItem() {
  return (
    <Link href="/" className={styles.bottomBarItemContent} prefetch={false}>
      <div className={styles.bottomBarItemIcon}>
        <IconHome size={20} />
      </div>
      <span className={styles.bottomBarItemLabel}>Home</span>
    </Link>
  );
}
