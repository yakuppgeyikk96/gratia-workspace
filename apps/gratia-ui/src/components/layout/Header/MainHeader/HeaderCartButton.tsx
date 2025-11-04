"use client";

import { useCartStore } from "@/store/cartStore";
import { Badge, Button, Flex, LoadingSpinner } from "@gratia/ui/components";
import { IconShoppingBag } from "@gratia/ui/icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HeaderCartButton() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const dataLoading = useCartStore((state) => state.dataLoading);
  const router = useRouter();

  const handleClick = () => {
    router.push("/cart");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || dataLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Button
      variant="ghost"
      icon={<IconShoppingBag />}
      ariaLabel="Cart"
      onClick={handleClick}
      disabled={dataLoading}
    >
      <Flex align="center" gap={8}>
        <span>Cart</span>
        {mounted && totalItems > 0 ? (
          <Badge count={totalItems} size="sm" color="secondary" />
        ) : null}
      </Flex>
    </Button>
  );
}
