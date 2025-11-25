"use client";

import { ShippingAddressFormData } from "@/schemas/checkoutSchema";
import { Address } from "@/types/Checkout.types";
import { FormField, Input } from "@gratia/ui/components";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import styles from "./ShippingForm.module.scss";

interface ShippingFormProps {
  register: UseFormRegister<ShippingAddressFormData>;
  errors: FieldErrors<ShippingAddressFormData>;
  prefix: "shippingAddress" | "billingAddress";
  title?: string;
}

export default function ShippingForm({
  register,
  errors,
  prefix,
  title,
}: ShippingFormProps) {
  const fieldErrors = errors[prefix] as FieldErrors<Address> | undefined;

  return (
    <div className={styles.shippingForm}>
      {title && <h3 className={styles.title}>{title}</h3>}

      <div className={styles.formGrid}>
        <div className={styles.formFieldHalf}>
          <FormField
            label="First Name"
            error={fieldErrors?.firstName?.message}
            required
          >
            <Input {...register(`${prefix}.firstName`)} placeholder="John" />
          </FormField>
        </div>

        <div className={styles.formFieldHalf}>
          <FormField
            label="Last Name"
            error={fieldErrors?.lastName?.message}
            required
          >
            <Input {...register(`${prefix}.lastName`)} placeholder="Doe" />
          </FormField>
        </div>

        <div className={styles.formFieldFull}>
          <FormField label="Phone" error={fieldErrors?.phone?.message} required>
            <Input
              type="tel"
              {...register(`${prefix}.phone`)}
              placeholder="+1234567890"
            />
          </FormField>
        </div>

        <div className={styles.formFieldFull}>
          <FormField
            label="Email"
            error={fieldErrors?.email?.message}
            hint="Order confirmation will be sent here"
          >
            <Input
              type="email"
              {...register(`${prefix}.email`)}
              placeholder="your@email.com"
            />
          </FormField>
        </div>

        <div className={styles.formFieldFull}>
          <FormField
            label="Address Line 1"
            error={fieldErrors?.addressLine1?.message}
            required
          >
            <Input
              {...register(`${prefix}.addressLine1`)}
              placeholder="123 Main Street"
            />
          </FormField>
        </div>

        <div className={styles.formFieldFull}>
          <FormField
            label="Address Line 2 (Optional)"
            hint="Apt, Suite, Unit, etc."
          >
            <Input
              {...register(`${prefix}.addressLine2`)}
              placeholder="Apt 4B"
            />
          </FormField>
        </div>

        <div className={styles.formFieldHalf}>
          <FormField label="City" error={fieldErrors?.city?.message} required>
            <Input {...register(`${prefix}.city`)} placeholder="New York" />
          </FormField>
        </div>

        <div className={styles.formFieldHalf}>
          <FormField label="State" error={fieldErrors?.state?.message} required>
            <Input {...register(`${prefix}.state`)} placeholder="NY" />
          </FormField>
        </div>

        <div className={styles.formFieldHalf}>
          <FormField
            label="Postal Code"
            error={fieldErrors?.postalCode?.message}
            required
          >
            <Input {...register(`${prefix}.postalCode`)} placeholder="10001" />
          </FormField>
        </div>

        <div className={styles.formFieldHalf}>
          <FormField
            label="Country"
            error={fieldErrors?.country?.message}
            required
          >
            <Input {...register(`${prefix}.country`)} placeholder="USA" />
          </FormField>
        </div>
      </div>
    </div>
  );
}
