import { IconChevronLeft, IconClose } from "../../icons";
import IconButton from "../IconButton";
import styles from "./Drawer.module.scss";

interface DrawerHeaderProps {
  title: string;
  canGoBack: boolean;
  onBack: () => void;
  onClose: () => void;
}

export default function DrawerHeader({
  title,
  canGoBack,
  onBack,
  onClose,
}: DrawerHeaderProps) {
  return (
    <div className={styles.drawerHeader}>
      <div className={styles.drawerHeaderLeft}>
        {canGoBack && (
          <IconButton
            icon={<IconChevronLeft size={20} />}
            onClick={onBack}
            ariaLabel="Go back"
            size="sm"
          />
        )}
      </div>

      <h2 className={styles.drawerTitle}>{title}</h2>

      <div className={styles.drawerHeaderRight}>
        <IconButton
          icon={<IconClose size={20} />}
          onClick={onClose}
          ariaLabel="Close"
          size="sm"
        />
      </div>
    </div>
  );
}
