import styles from "./ShippingMethodCardSkeleton.module.scss";

export default function ShippingMethodCardSkeleton() {
  return (
    <div className={styles.methodCard}>
      <div className={styles.radioIndicator}>
        <div className={styles.radioCircle} />
      </div>

      <div className={styles.methodContent}>
        <div className={styles.methodHeader}>
          <div className={styles.methodInfo}>
            <div className={styles.methodNameSkeleton} />
            <div className={styles.carrierSkeleton} />
          </div>
          <div className={styles.methodPriceSkeleton} />
        </div>

        <div className={styles.descriptionSkeleton} />

        <div className={styles.methodMeta}>
          <div className={styles.estimatedDaysSkeleton} />
        </div>
      </div>
    </div>
  );
}

