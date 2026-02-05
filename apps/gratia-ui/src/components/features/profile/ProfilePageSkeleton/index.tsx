import Container from "@gratia/ui/components/Container";
import styles from "./ProfilePageSkeleton.module.scss";

export default function ProfilePageSkeleton() {
  return (
    <Container>
      <div className={styles.skeleton}>
        <div className={styles.headerSkeleton}>
          <div className={styles.avatarSkeleton} />
          <div className={styles.headerTextGroup}>
            <div className={styles.nameSkeleton} />
            <div className={styles.emailSkeleton} />
          </div>
        </div>
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
