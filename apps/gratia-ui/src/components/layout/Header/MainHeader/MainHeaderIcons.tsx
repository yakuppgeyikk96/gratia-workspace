"use client";

import { IconButton } from "@gratia/ui/components";
import { IconBell, IconHeart } from "@gratia/ui/icons";

export default function MainHeaderIcons() {
  const handleBellClick = () => {
    // TODO: Implement bell click
  };

  const handleHeartClick = () => {
    // TODO: Implement heart click
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
