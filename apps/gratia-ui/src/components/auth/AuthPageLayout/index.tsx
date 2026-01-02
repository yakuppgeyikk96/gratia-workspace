import Container from "@gratia/ui/components/Container";
import styles from "./AuthPageLayout.module.scss";

export default function AuthPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.authPageWrapper}>
      <Container className={styles.authPageFormContainer}>{children}</Container>
    </div>
  );
}
