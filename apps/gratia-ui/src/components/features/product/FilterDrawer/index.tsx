"use client";

import IconButton from "@gratia/ui/components/IconButton";
import IconClose from "@gratia/ui/icons/IconClose";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./FilterDrawer.module.scss";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  title = "Filtreler",
  children,
}: FilterDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (panelRef.current) panelRef.current.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const drawer = (
    <>
      <div
        className={styles.overlay}
        onClick={handleOverlayClick}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={styles.panel}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <IconButton
            ariaLabel="Kapat"
            onClick={onClose}
            icon={<IconClose size={20} />}
          />
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </>
  );

  return createPortal(drawer, document.body);
}
