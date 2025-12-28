"use client";

import { sendVerificationEmail } from "@/actions";
import {
  registerSchema,
  type RegisterFormData,
} from "@/schemas/registerSchema";
import {
  Button,
  Checkbox,
  FormField,
  Input,
  useToastContext,
} from "@gratia/ui/components";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import EmailField from "../shared/EmailField";
import PasswordField from "../shared/PasswordField";
import styles from "./RegisterForm.module.scss";

export default function RegisterForm() {
  const { addToast } = useToastContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormData> = async (
    data: RegisterFormData
  ) => {
    const { firstName, lastName, email, password } = data;

    const response = await sendVerificationEmail({
      firstName,
      lastName,
      email,
      password,
    });

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
            <div className={styles.formField}>
              <FormField
                error={errors.firstName?.message}
                required
                name="firstName"
              >
                <Input
                  {...register("firstName")}
                  variant="outlined"
                  size="lg"
                  placeholder="Enter your firstname"
                  error={!!errors.firstName}
                />
              </FormField>
            </div>

            <div className={styles.formField}>
              <FormField
                error={errors.lastName?.message}
                required
                name="lastName"
              >
                <Input
                  {...register("lastName")}
                  variant="outlined"
                  size="lg"
                  placeholder="Enter your lastname"
                  error={!!errors.lastName}
                />
              </FormField>
            </div>

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
              <FormField error={errors.terms?.message} name="terms">
                <Checkbox
                  {...register("terms")}
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
              </FormField>
            </div>

            <div className={styles.formFieldFull}>
              <Button
                type="submit"
                variant="primary"
                className={styles.submitButton}
                loading={isSubmitting}
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
