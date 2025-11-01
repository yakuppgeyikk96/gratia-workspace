import classNames from "classnames";
import { IconChevronRight } from "../../icons";
import Badge from "../Badge";
import styles from "./Drawer.module.scss";
import { DrawerItem as DrawerItemType } from "./Drawer.types";

interface DrawerItemProps {
  item: DrawerItemType;
  onNavigate?: (item: DrawerItemType) => void;
  onClose?: () => void;
}

export default function DrawerItem({
  item,
  onNavigate,
  onClose,
}: DrawerItemProps) {
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (item.disabled) return;

    if (hasChildren) {
      onNavigate?.(item);
      return;
    }

    item.onClick?.();
    onClose?.();
  };

  return (
    <button
      className={classNames(
        styles.drawerItem,
        item.disabled && styles.disabled
      )}
      onClick={handleClick}
      disabled={item.disabled}
    >
      {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}

      <span className={styles.itemLabel}>{item.label}</span>

      {item.badge !== undefined && item.badge > 0 && (
        <Badge count={item.badge} size="sm" color="secondary" />
      )}

      {hasChildren && (
        <span className={styles.itemArrow}>
          <IconChevronRight size={20} />
        </span>
      )}
    </button>
  );
}
