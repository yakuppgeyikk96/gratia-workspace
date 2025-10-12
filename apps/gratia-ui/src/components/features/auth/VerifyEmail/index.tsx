"use client";

import { registerUser } from "@/actions/auth/authActions";
import { Container, OneTimePassword, useToastContext } from "@gratia/ui";
import styles from "./VerifyEmail.module.scss";

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

    console.log("Verification code:", code);
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
        <OneTimePassword
          length={6}
          size="md"
          variant="outlined"
          onComplete={handleComplete}
          autoFocus
        />
      </Container>
    </div>
  );
}
