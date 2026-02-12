"use client";

import { vendorSchema, type VendorFormData } from "@/schemas/vendorSchema";
import { useVendorRegistration } from "@/hooks/useVendorRegistration";
import { slugify } from "@/lib/utils/string";
import type { IUser } from "@/types/User.types";
import Button from "@gratia/ui/components/Button";
import FormField from "@gratia/ui/components/FormField";
import Input from "@gratia/ui/components/Input";
import Textarea from "@gratia/ui/components/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import styles from "./BecomeVendorForm.module.scss";

interface BecomeVendorFormProps {
  user: IUser;
}

export default function BecomeVendorForm({ user }: BecomeVendorFormProps) {
  const { handleCreateVendor, isPending } = useVendorRegistration();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    mode: "onBlur",
    defaultValues: {
      storeName: "",
      storeSlug: "",
      email: user.email,
      storeDescription: "",
      phone: "",
    },
  });

  const handleStoreNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value;
      setValue("storeSlug", slugify(name), { shouldValidate: true });
    },
    [setValue]
  );

  const onSubmit: SubmitHandler<VendorFormData> = (data) => {
    handleCreateVendor({
      userId: user.id,
      storeName: data.storeName,
      storeSlug: data.storeSlug,
      email: data.email,
      storeDescription: data.storeDescription || undefined,
      phone: data.phone || undefined,
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Become a Vendor</h1>
      <p className={styles.subtitle}>
        Set up your store and start selling on Gratia.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formGrid}>
          <div className={styles.formFieldFull}>
            <FormField
              label="Store Name"
              error={errors.storeName?.message}
              required
              name="storeName"
            >
              <Input
                {...register("storeName", {
                  onChange: handleStoreNameChange,
                })}
                variant="outlined"
                size="lg"
                placeholder="My Awesome Store"
                error={!!errors.storeName}
              />
            </FormField>
          </div>

          <div className={styles.formFieldFull}>
            <FormField
              label="Store Slug"
              error={errors.storeSlug?.message}
              required
              name="storeSlug"
              hint="This will be your store URL identifier"
            >
              <Input
                {...register("storeSlug")}
                variant="outlined"
                size="lg"
                placeholder="my-awesome-store"
                error={!!errors.storeSlug}
              />
            </FormField>
          </div>

          <div className={styles.formFieldFull}>
            <FormField
              label="Email"
              error={errors.email?.message}
              required
              name="email"
            >
              <Input
                {...register("email")}
                type="email"
                variant="outlined"
                size="lg"
                placeholder="your@email.com"
                error={!!errors.email}
              />
            </FormField>
          </div>

          <div className={styles.formFieldFull}>
            <FormField
              label="Phone"
              error={errors.phone?.message}
              name="phone"
              hint="E.164 format, e.g. +1234567890"
            >
              <Input
                {...register("phone")}
                type="tel"
                variant="outlined"
                size="lg"
                placeholder="+1234567890"
                error={!!errors.phone}
              />
            </FormField>
          </div>

          <div className={styles.formFieldFull}>
            <FormField
              label="Store Description"
              error={errors.storeDescription?.message}
              name="storeDescription"
            >
              <Textarea
                {...register("storeDescription")}
                variant="outlined"
                size="lg"
                rows={4}
                placeholder="Tell customers about your store..."
                error={!!errors.storeDescription}
              />
            </FormField>
          </div>

          <div className={styles.formFieldFull}>
            <Button
              type="submit"
              variant="primary"
              className={styles.submitButton}
              loading={isPending}
            >
              Create Vendor Account
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
