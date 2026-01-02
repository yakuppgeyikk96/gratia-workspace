import styles from "./ProductsLoading.module.scss";

export default function ProductsLoading() {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonText} />
            <div className={styles.skeletonTextShort} />
          </div>
        ))}
      </div>
    </div>
  );
}
