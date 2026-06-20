"use client";

import { useWishlist } from "@/hooks/useWishlist";
import IconButton from "@gratia/ui/components/IconButton";
import IconBell from "@gratia/ui/icons/IconBell";
import IconHeart from "@gratia/ui/icons/IconHeart";
import { useRouter } from "next/navigation";

interface MainHeaderIconsProps {
  isLoggedIn: boolean;
}

export default function MainHeaderIcons({ isLoggedIn }: MainHeaderIconsProps) {
  const router = useRouter();
  const { wishlist } = useWishlist(isLoggedIn);

  const handleBellClick = () => {
    // TODO: Implement notifications
  };

  const handleHeartClick = () => {
    router.push("/wishlist");
  };

  return (
    <>
      <IconButton
        icon={<IconBell />}
        onClick={handleBellClick}
        ariaLabel="Notifications"
      />
      <IconButton
        icon={<IconHeart />}
        onClick={handleHeartClick}
        ariaLabel="Wishlist"
        badge={wishlist.count > 0 ? wishlist.count : undefined}
        badgeColor="secondary"
      />
    </>
  );
}
