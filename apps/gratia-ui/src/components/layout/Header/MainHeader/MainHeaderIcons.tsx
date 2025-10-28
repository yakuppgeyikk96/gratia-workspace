"use client";

import { IconButton } from "@gratia/ui/components";
import { IconBell, IconHeart } from "@gratia/ui/icons";

export default function MainHeaderIcons() {
  const handleBellClick = () => {
    console.log("Bell clicked");
  };

  const handleHeartClick = () => {
    console.log("Heart clicked");
  };

  return (
    <>
      <IconButton
        icon={<IconBell />}
        onClick={handleBellClick}
        ariaLabel="Bell"
      />
      <IconButton
        icon={<IconHeart />}
        onClick={handleHeartClick}
        ariaLabel="Heart"
      />
    </>
  );
}
