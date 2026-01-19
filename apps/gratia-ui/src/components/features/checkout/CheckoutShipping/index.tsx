"use client";

import { updateShippingAddress } from "@/actions";
import {
  ShippingAddressFormData,
  shippingAddressSchema,
} from "@/schemas/checkoutSchema";
import { CheckoutSession } from "@/types/Checkout.types";
import Button from "@gratia/ui/components/Button";
import Checkbox from "@gratia/ui/components/Checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ShippingForm from "../ShippingForm";
import styles from "./CheckoutShipping.module.scss";

interface CheckoutShippingProps {
  shippingAddress: CheckoutSession["shippingAddress"];
  billingAddress: CheckoutSession["billingAddress"];
}

export default function CheckoutShipping({ shippingAddress, billingAddress }: CheckoutShippingProps) {
  const router = useRouter();
  const [billingIsSame, setBillingIsSame] = useState<boolean>(
    billingAddress === null ||
      JSON.stringify(shippingAddress) ===
        JSON.stringify(billingAddress)
  );
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ShippingAddressFormData>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      shippingAddress: shippingAddress || {},
      billingAddress: billingIsSame
        ? null
        : billingAddress || shippingAddress || null,
      billingIsSameAsShipping: billingIsSame,
    },
  });

  useEffect(() => {
    setValue("billingIsSameAsShipping", billingIsSame);
  }, [billingIsSame, setValue]);

  const handleBillingIsSameChange = (checked: boolean) => {
    setBillingIsSame(checked);
  };

  const onSubmit = async (data: ShippingAddressFormData) => {
    setIsLoading(true);

    try {
      const response = await updateShippingAddress({
        shippingAddress: data.shippingAddress,
        billingAddress: billingIsSame
          ? undefined
          : data.billingAddress || undefined,
        billingIsSameAsShipping: billingIsSame,
      });

      if (response.success) {
        router.push(`/checkout?step=shipping-method`);
      } else {
        console.error("Update failed:", response);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.checkoutShipping}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input
          type="hidden"
          {...register("billingIsSameAsShipping")}
          value={billingIsSame ? "true" : "false"}
        />

        <section className={styles.section}>
          <ShippingForm
            register={register}
            errors={errors}
            prefix="shippingAddress"
            title="Shipping Address"
            watch={watch}
          />
        </section>

        <section className={styles.section}>
          <div className={styles.billingHeader}>
            <Checkbox
              checked={billingIsSame}
              onValueChange={handleBillingIsSameChange}
              label="Billing address is same as shipping address"
            />
          </div>

          {!billingIsSame && (
            <div className={styles.billingForm}>
              <ShippingForm
                register={register}
                errors={errors}
                prefix="billingAddress"
                title="Billing Address"
                watch={watch}
              />
            </div>
          )}
        </section>

        <div className={styles.actions}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className={styles.continueButton}
          >
            Save and Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
