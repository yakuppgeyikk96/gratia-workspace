"use client";

import { registerUser } from "@/actions";
import Container from "@gratia/ui/components/Container";
import { useToastContext } from "@gratia/ui/components/Toast";
import { lazy, Suspense } from "react";
import styles from "./VerifyEmail.module.scss";

const OneTimePassword = lazy(
  () => import("@gratia/ui/components/OneTimePassword")
);

interface VerifyEmailProps {
  token: string;
}

export default function VerifyEmail({ token }: VerifyEmailProps) {
  const { addToast } = useToastContext();

  const handleComplete = async (code: string) => {
    const response = await registerUser({
      token: token,
      code: code,
    });

    if (response.success) {
      addToast({
        description: response.message,
        variant: "success",
        duration: 2000,
      });
    }
  };

  return (
    <div className={styles.verifyEmailContainer}>
      <Container className={styles.verifyEmailContent}>
        <div className={styles.verifyEmailContentHeader}>
          <h1 className={styles.verifyEmailTitle}>Verify your email</h1>
          <p className={styles.verifyEmailDescription}>
            We sent a verification code to your email. Please enter the code to
            verify your email.
          </p>
        </div>
        <Suspense fallback={null}>
          <OneTimePassword
            length={6}
            size="md"
            variant="outlined"
            onComplete={handleComplete}
            autoFocus
          />
        </Suspense>
      </Container>
    </div>
  );
}
