import styles from "./QuantitySelectorSkeleton.module.scss";

function QuantitySelectorSkeleton() {
  return (
    <div className={styles.quantitySelectorSkeleton}>
      <div className={styles.inCartBadgeSkeleton} />
      <div className={styles.quantitySelectorWrapperSkeleton}>
        <div className={styles.quantityButtonSkeleton} />
        <div className={styles.quantityValueSkeleton} />
        <div className={styles.quantityButtonSkeleton} />
      </div>
    </div>
  );
}

export default QuantitySelectorSkeleton;

