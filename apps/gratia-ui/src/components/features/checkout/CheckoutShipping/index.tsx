"use client";

import { updateShippingAddress } from "@/actions/checkout";
import {
  ShippingAddressFormData,
  shippingAddressSchema,
} from "@/schemas/checkoutSchema";
import { CheckoutSession } from "@/types/Checkout.types";
import { Button, Checkbox } from "@gratia/ui/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ShippingForm from "../ShippingForm";
import styles from "./CheckoutShipping.module.scss";

interface Props {
  session: CheckoutSession;
}

export default function CheckoutShipping({ session }: Props) {
  const router = useRouter();
  const [billingIsSame, setBillingIsSame] = useState<boolean>(
    session.billingAddress === null ||
      JSON.stringify(session.shippingAddress) ===
        JSON.stringify(session.billingAddress)
  );
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ShippingAddressFormData>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      shippingAddress: session.shippingAddress || {},
      billingAddress: billingIsSame
        ? null
        : session.billingAddress || session.shippingAddress || null,
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

  console.log("Form errors:", errors);

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
            Continue to Shipping Method
          </Button>
        </div>
      </form>
    </div>
  );
}
