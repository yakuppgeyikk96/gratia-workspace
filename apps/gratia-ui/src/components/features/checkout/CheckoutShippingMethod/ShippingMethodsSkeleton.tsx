import ShippingMethodCardSkeleton from "./ShippingMethodCardSkeleton";
import styles from "./ShippingMethodsSkeleton.module.scss";

export default function ShippingMethodsSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSkeleton} />
        <div className={styles.subtitleSkeleton} />
      </div>

      <div className={styles.methodsList}>
        {Array.from({ length: 3 }).map((_, index) => (
          <ShippingMethodCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

