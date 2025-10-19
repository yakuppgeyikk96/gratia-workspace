"use client";

import { loginUser } from "@/actions/auth/authActions";
import { COLORS } from "@/constants/colors";
import { loginSchema, type LoginFormData } from "@/schemas/loginSchema";
import {
  Button,
  FormField,
  IconAt,
  IconPassword,
  IconVisibility,
  Input,
  useToastContext,
} from "@gratia/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
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
        <h2 className={styles.title}>Create an account</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formContent}>
            <div className={styles.formFieldFull}>
              <FormField error={errors.email?.message} required name="email">
                <Input
                  {...register("email")}
                  variant="outlined"
                  size="lg"
                  startIcon={<IconAt color={COLORS.ICON_MUTED} size={16} />}
                  placeholder="Enter your email"
                  error={!!errors.email}
                />
              </FormField>
            </div>

            <div className={styles.formFieldFull}>
              <FormField
                error={errors.password?.message}
                required
                name="password"
              >
                <Input
                  {...register("password")}
                  variant="outlined"
                  size="lg"
                  startIcon={
                    <IconPassword color={COLORS.ICON_MUTED} size={16} />
                  }
                  endIcon={
                    <IconVisibility color={COLORS.ICON_MUTED} size={16} />
                  }
                  placeholder="Enter your password"
                  error={!!errors.password}
                />
              </FormField>
            </div>

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
          <Link href="/register" className={styles.loginLink}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
