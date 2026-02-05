import Link from "next/link";
import type { Order } from "@/types/Order.types";
import { formatPrice } from "@/lib/utils/format";
import OrderStatusBadge from "../OrderStatusBadge";
import styles from "./OrderHistoryCard.module.scss";

interface OrderHistoryCardProps {
  order: Order;
}

export default function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link href={`/orders/${order.orderNumber}`} className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.orderNumber}>{order.orderNumber}</span>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.detail}>
          <span className={styles.label}>Date</span>
          <span className={styles.value}>{formattedDate}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>Items</span>
          <span className={styles.value}>{totalItems}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>Total</span>
          <span className={styles.value}>{formatPrice(order.pricing.total)}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>Payment</span>
          <span className={styles.value}>
            <OrderStatusBadge status={order.paymentStatus} />
          </span>
        </div>
      </div>
    </Link>
  );
}
