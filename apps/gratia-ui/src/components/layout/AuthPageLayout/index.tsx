import { Container } from "@gratia/ui";
import styles from "./AuthPageLayout.module.scss";

export default function AuthPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className={styles.authPageWrapper}>
      <Container className={styles.authPageFormContainer}>{children}</Container>
    </main>
  );
}
