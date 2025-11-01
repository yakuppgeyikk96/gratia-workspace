"use client";

import React, { cloneElement, isValidElement, useState } from "react";
import { DRAWER_ANIMATION_DURATION } from "./constants";
import { DrawerProps } from "./Drawer.types";
import DrawerContent from "./DrawerContent";
import { useDrawerNavigation } from "./useDrawerNavigation";

export default function Drawer({
  trigger,
  items,
  title = "Menu",
  position = "left",
  onClose: onCloseProp,
}: DrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    currentLevel,
    canGoBack,
    currentTitle,
    navigateToChildren,
    navigateBack,
    reset,
  } = useDrawerNavigation(items, title);

  const handleOpen = () => {
    setIsOpen(true);
    reset();
  };

  const handleClose = () => {
    setIsOpen(false);
    onCloseProp?.();
    setTimeout(reset, DRAWER_ANIMATION_DURATION);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    handleOpen();
  };

  const triggerElement = isValidElement(trigger)
    ? cloneElement(trigger as React.ReactElement<any>, {
        onClick: handleTriggerClick,
      })
    : trigger;

  return (
    <>
      {triggerElement}
      <DrawerContent
        isOpen={isOpen}
        position={position}
        title={currentTitle}
        currentLevel={currentLevel}
        canGoBack={canGoBack}
        onBack={navigateBack}
        onClose={handleClose}
        onNavigate={navigateToChildren}
      />
    </>
  );
}
