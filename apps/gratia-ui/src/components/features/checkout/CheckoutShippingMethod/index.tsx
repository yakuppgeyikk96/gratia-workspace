"use client";

import {
  getAvailableShippingMethods,
  selectShippingMethod,
} from "@/actions/checkout";
import Button from "@gratia/ui/components/Button";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./CheckoutShippingMethod.module.scss";
import ShippingMethodCard from "./ShippingMethodCard";
import ShippingMethodsSkeleton from "./ShippingMethodsSkeleton";

export default function CheckoutShippingMethod({
  shippingMethodId,
}: {
  shippingMethodId: number | null;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState<number | null>(null);

  const { data, isLoading: isLoadingMethods } = useQuery({
    queryKey: ["available-shipping-methods"],
    queryFn: getAvailableShippingMethods,
  });

  const shippingMethods = data?.data || [];
  const selectedMethodId = shippingMethodId;

  const handleMethodSelect = async (methodId: number) => {
    if (selectedMethodId === methodId) return;

    setIsSelecting(methodId);

    try {
      const response = await selectShippingMethod({
        shippingMethodId: methodId,
      });

      if (response.success) {
        router.refresh();
      } else {
        console.error("Failed to select shipping method:", response);
        setIsSelecting(null);
      }
    } catch (error) {
      console.error("Error selecting shipping method:", error);
      setIsSelecting(null);
    }
  };

  const handleContinue = async () => {
    if (!selectedMethodId) return;

    setIsLoading(true);
    try {
      router.push(`/checkout?step=payment`);
    } catch (error) {
      console.error("Error navigating to payment:", error);
      setIsLoading(false);
    }
  };

  if (isLoadingMethods) {
    return <ShippingMethodsSkeleton />;
  }

  if (!data?.success || shippingMethods.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {data?.message || "No shipping methods available"}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Select Shipping Method</h2>
        <p className={styles.subtitle}>Choose your preferred delivery option</p>
      </div>

      <div className={styles.methodsList}>
        {shippingMethods.map((method) => {
          const isSelected = selectedMethodId === method.id;
          const isSelectingMethod = isSelecting === method.id;

          return (
            <ShippingMethodCard
              key={method.id}
              method={method}
              isSelected={isSelected}
              onClick={() => handleMethodSelect(method.id)}
              disabled={isSelectingMethod}
            />
          );
        })}
      </div>

      <div className={styles.actions}>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleContinue}
          disabled={!selectedMethodId || isLoading}
          loading={isLoading}
          className={styles.continueButton}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
