"use client";

import { useCartContext } from "@/components/providers/CartProvider";
import Flex from "@gratia/ui/components/Flex";
import CartItem from "../CartItem";

export default function CartListV2() {
  const { items, getAvailableItems, getUnavailableItems } = useCartContext();

  const availableItems = getAvailableItems();
  const unavailableItems = getUnavailableItems();

  if (items.length === 0) {
    return null;
  }

  return (
    <Flex direction="column" gap={12}>
      {/* Available items first */}
      {availableItems.map((item) => (
        <CartItem key={item.sku} item={item} />
      ))}

      {/* Unavailable items with separator */}
      {unavailableItems.length > 0 && (
        <>
          <div className="unavailable-section-divider">
            <span>Satın Alınamayan Ürünler ({unavailableItems.length})</span>
          </div>
          {unavailableItems.map((item) => (
            <CartItem key={item.sku} item={item} />
          ))}
        </>
      )}

      <style jsx>{`
        .unavailable-section-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }
        .unavailable-section-divider::before,
        .unavailable-section-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background-color: #e5e7eb;
        }
      `}</style>
    </Flex>
  );
}