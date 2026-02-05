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
        <div className={styles.menuLinkSkeleton} />
      </div>
    </Container>
  );
}