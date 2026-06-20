"use client";

import { COLORS } from "@/constants/colors";
import { useWishlist } from "@/hooks/useWishlist";
import IconButton from "@gratia/ui/components/IconButton";
import { useToastContext } from "@gratia/ui/components/Toast";
import { Heart } from "lucide-react";

interface WishlistButtonProps {
  productId: number;
  isLoggedIn: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ICON_SIZE_BY_BUTTON: Record<"sm" | "md" | "lg", number> = {
  sm: 18,
  md: 20,
  lg: 24,
};

const ACTIVE_COLOR = COLORS.ERROR;
const INACTIVE_COLOR = COLORS.ICON_DEFAULT;

export default function WishlistButton({
  productId,
  isLoggedIn,
  size = "sm",
  className,
}: WishlistButtonProps) {
  const { isInWishlist, toggle, isPending } = useWishlist(isLoggedIn);
  const { addToast } = useToastContext();
  const isActive = isInWishlist(productId);
  const iconSize = ICON_SIZE_BY_BUTTON[size];

  const handleClick = () => {
    if (!isLoggedIn) {
      addToast({
        description: "Log in to save items to your wishlist",
        variant: "info",
        duration: 2500,
      });
      return;
    }
    toggle(productId);
  };

  return (
    <IconButton
      icon={
        <Heart
          size={iconSize}
          color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
          fill={isActive ? ACTIVE_COLOR : "none"}
          strokeWidth={1.8}
        />
      }
      size={size}
      onClick={handleClick}
      disabled={isPending}
      ariaLabel={isActive ? "Remove from wishlist" : "Add to wishlist"}
      {...(className ? { className } : {})}
    />
  );
}
