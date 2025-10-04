"use client";

import { COLORS } from "@/constants/colors";
import {
  Button,
  Checkbox,
  IconAt,
  IconPassword,
  IconVisibility,
  Input,
} from "@gratia/ui";
import Link from "next/link";
import { useForm } from "react-hook-form";
import styles from "./RegisterForm.module.scss";

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    terms: boolean;
  }>();

  const onSubmit = (data: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    terms: boolean;
  }) => {
    console.log(data);
  };

  console.log(errors);

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h1 className={styles.brand}>GRATIA</h1>
        <h2 className={styles.title}>Create an account</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formContent}>
            <div className={styles.formField}>
              <Input
                {...register("firstname")}
                variant="outlined"
                size="lg"
                placeholder="Enter your firstname"
              />
            </div>

            <div className={styles.formField}>
              <Input
                {...register("lastname")}
                variant="outlined"
                size="lg"
                placeholder="Enter your lastname"
              />
            </div>

            <div className={styles.formFieldFull}>
              <Input
                {...register("email", { required: true })}
                variant="outlined"
                size="lg"
                startIcon={<IconAt color={COLORS.ICON_MUTED} size={16} />}
                placeholder="Enter your email"
                error={!!errors.email}
              />
            </div>

            <div className={styles.formFieldFull}>
              <Input
                {...register("password", { required: true })}
                variant="outlined"
                size="lg"
                startIcon={<IconPassword color={COLORS.ICON_MUTED} size={16} />}
                endIcon={<IconVisibility color={COLORS.ICON_MUTED} size={16} />}
                placeholder="Enter your password"
                error={!!errors.password}
              />
            </div>

            <div className={styles.formFieldFull}>
              <Checkbox
                {...register("terms", { required: true })}
                size="sm"
                error={!!errors.terms}
                label={
                  <span>
                    I agree to{" "}
                    <Link href="#" className={styles.termsPolicyLink}>
                      Terms & Privacy Policy
                    </Link>
                  </span>
                }
              />
            </div>

            <div className={styles.formFieldFull}>
              <Button
                type="submit"
                variant="primary"
                className={styles.submitButton}
              >
                Create Account
              </Button>
            </div>
          </div>
        </form>

        <div className={styles.alreadyHaveAccount}>
          <p>Already have an account?</p>
          <Link href="/login" className={styles.loginLink}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
