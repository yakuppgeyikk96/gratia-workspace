import type { OrderStatus, PaymentStatus } from "@/types/Order.types";
import styles from "./OrderStatusBadge.module.scss";

interface OrderStatusBadgeProps {
  status: OrderStatus | PaymentStatus;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  paid: "Paid",
  failed: "Failed",
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const label = STATUS_LABELS[status] || status;

  return <span className={`${styles.badge} ${styles[status]}`}>{label}</span>;
}
