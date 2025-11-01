import styles from "./Drawer.module.scss";
import { DrawerItem as DrawerItemType } from "./Drawer.types";
import DrawerItem from "./DrawerItem";

interface DrawerListProps {
  items: DrawerItemType[];
  onNavigate: (item: DrawerItemType) => void;
  onClose: () => void;
}

export default function DrawerList({
  items,
  onNavigate,
  onClose,
}: DrawerListProps) {
  return (
    <div className={styles.drawerList}>
      {items.map((item) => (
        <DrawerItem
          key={item.id}
          item={item}
          onNavigate={onNavigate}
          onClose={onClose}
        />
      ))}
    </div>
  );
}
