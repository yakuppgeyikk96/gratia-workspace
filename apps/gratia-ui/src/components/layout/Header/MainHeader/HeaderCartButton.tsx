"use client";

import { useCartStore } from "@/store/cartStore";
import Badge from "@gratia/ui/components/Badge/";
import Button from "@gratia/ui/components/Button/";
import Flex from "@gratia/ui/components/Flex/";
import LoadingSpinner from "@gratia/ui/components/LoadingSpinner/";
import IconShoppingBag from "@gratia/ui/icons/IconShoppingBag";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HeaderCartButton() {
  const [mounted, setMounted] = useState(false);

  const isLoading = useCartStore((state) => state.isLoading);
  const totalItems = useCartStore((state) => state.getTotalItems());

  const router = useRouter();

  const handleClick = () => {
    router.push("/cart");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Button
      variant="ghost"
      icon={<IconShoppingBag />}
      ariaLabel="Cart"
      onClick={handleClick}
      disabled={isLoading}
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
