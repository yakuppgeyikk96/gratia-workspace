import RegisterForm from "@/components/features/auth/RegisterForm";
import { Container } from "@gratia/ui";
import styles from "./RegisterPageLayout.module.scss";

export default function RegisterPageLayout() {
  return (
    <main className={styles.registerPageWrapper}>
      <Container className={styles.registerPageFormContainer}>
        <RegisterForm />
      </Container>
    </main>
  );
}
