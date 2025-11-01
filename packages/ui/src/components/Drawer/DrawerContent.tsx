import classNames from "classnames";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Drawer.module.scss";
import { DrawerItem } from "./Drawer.types";
import DrawerHeader from "./DrawerHeader";
import DrawerList from "./DrawerList";

interface DrawerContentProps {
  isOpen: boolean;
  position: "left" | "right";
  title: string;
  currentLevel: DrawerItem[];
  canGoBack: boolean;
  onBack: () => void;
  onClose: () => void;
  onNavigate: (item: DrawerItem) => void;
}

export default function DrawerContent({
  isOpen,
  position,
  title,
  currentLevel,
  canGoBack,
  onBack,
  onClose,
  onNavigate,
}: DrawerContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClose();
  };

  // Combined effect for body scroll lock, keyboard events, and focus management
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the drawer content
    if (contentRef.current) {
      contentRef.current.focus();
    }

    // Keyboard event handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        canGoBack ? onBack() : onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, canGoBack, onBack, onClose]);

  if (!isOpen) return null;

  const drawerContent = (
    <>
      <div className={styles.drawerOverlay} onClick={handleOverlayClick} />
      <div
        ref={contentRef}
        tabIndex={-1}
        className={classNames(
          styles.drawerContent,
          styles[`drawer-${position}`],
          isOpen && styles.open
        )}
      >
        <DrawerHeader
          title={title}
          canGoBack={canGoBack}
          onBack={onBack}
          onClose={onClose}
        />
        <DrawerList
          items={currentLevel}
          onNavigate={onNavigate}
          onClose={onClose}
        />
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}
