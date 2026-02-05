import type { PaginatedOrders } from "@/types/Order.types";
import OrderHistoryCard from "../OrderHistoryCard";
import OrderHistoryPagination from "../OrderHistoryPagination";
import styles from "./OrderHistoryList.module.scss";

interface OrderHistoryListProps {
  ordersData: PaginatedOrders | null;
}

export default function OrderHistoryList({
  ordersData,
}: OrderHistoryListProps) {
  if (!ordersData || ordersData.orders.length === 0) {
    return (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Order History</h2>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>You have no orders yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Order History</h2>
      <div className={styles.orderList}>
        {ordersData.orders.map((order) => (
          <OrderHistoryCard key={order.id} order={order} />
        ))}
      </div>
      {ordersData.pagination.totalPages > 1 && (
        <OrderHistoryPagination pagination={ordersData.pagination} />
      )}
    </div>
  );
}
