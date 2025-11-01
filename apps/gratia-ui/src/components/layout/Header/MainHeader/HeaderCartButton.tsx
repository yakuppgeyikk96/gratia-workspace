"use client";

import { useCartStore } from "@/store/cartStore";
import { Badge, Button, Flex } from "@gratia/ui/components";
import { IconShoppingBag } from "@gratia/ui/icons";
import { useRouter } from "next/navigation";

export default function HeaderCartButton() {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const router = useRouter();

  const handleClick = () => {
    router.push("/cart");
  };

  return (
    <Button
      variant="ghost"
      icon={<IconShoppingBag />}
      ariaLabel="Cart"
      onClick={handleClick}
    >
      <Flex align="center" gap={8}>
        <span>Cart</span>
        {totalItems > 0 ? (
          <Badge count={totalItems} size="sm" color="secondary" />
        ) : null}
      </Flex>
    </Button>
  );
}
