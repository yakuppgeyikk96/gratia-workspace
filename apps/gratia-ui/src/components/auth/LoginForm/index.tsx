"use client";

import { loginUser } from "@/actions/auth";
import { loginSchema, type LoginFormData } from "@/schemas/loginSchema";
import Button from "@gratia/ui/components/Button";
import { useToastContext } from "@gratia/ui/components/Toast";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import EmailField from "../shared/EmailField";
import PasswordField from "../shared/PasswordField";
import styles from "./LoginForm.module.scss";

export default function LoginForm() {
  const { addToast } = useToastContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (
    data: LoginFormData
  ) => {
    const response = await loginUser(data);

    if (!response.success) {
      addToast({
        description: response.message,
        variant: "error",
        duration: 2000,
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h1 className={styles.brand}>GRATIA</h1>
        <h2 className={styles.title}>Login to your account</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formContent}>
            <EmailField
              register={register("email")}
              error={errors.email}
              className={styles.formFieldFull}
            />

            <PasswordField
              register={register("password")}
              error={errors.password}
              className={styles.formFieldFull}
            />

            <div className={styles.formFieldFull}>
              <Button
                type="submit"
                variant="primary"
                className={styles.submitButton}
                loading={isSubmitting}
              >
                Login
              </Button>
            </div>
          </div>
        </form>

        <div className={styles.alreadyHaveAccount}>
          <p>{"Don't have an account?"}</p>
          <Link href="/register" className={styles.loginLink} prefetch={false}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
