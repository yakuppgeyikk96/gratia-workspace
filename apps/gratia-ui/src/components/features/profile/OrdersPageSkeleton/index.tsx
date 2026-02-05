import Container from "@gratia/ui/components/Container";
import styles from "./OrdersPageSkeleton.module.scss";

export default function OrdersPageSkeleton() {
  return (
    <Container>
      <div className={styles.skeleton}>
        <div className={styles.sectionTitleSkeleton} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.cardSkeleton}>
            <div className={styles.cardHeaderSkeleton}>
              <div className={styles.orderNumberSkeleton} />
              <div className={styles.badgeSkeleton} />
            </div>
            <div className={styles.cardBodySkeleton}>
              <div className={styles.detailSkeleton} />
              <div className={styles.detailSkeleton} />
              <div className={styles.detailSkeleton} />
              <div className={styles.detailSkeleton} />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}