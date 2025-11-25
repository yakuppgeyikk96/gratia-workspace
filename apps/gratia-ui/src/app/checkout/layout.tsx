import { redirect } from "next/navigation";
import CheckoutPagesLayout from "@/components/features/checkout/CheckoutPagesLayout";
import { getCheckoutSessionFromCookie } from "@/actions/checkout";
import { CheckoutStep } from "@/types/Checkout.types";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionResponse = await getCheckoutSessionFromCookie();

  if (!sessionResponse.success || !sessionResponse.data) {
    redirect("/cart");
  }

  const currentStep = sessionResponse.data.currentStep;

  // CheckoutStepper doesn't show "completed" step, so exclude it
  const stepperStep: Exclude<CheckoutStep, "completed"> =
    currentStep === "completed" ? "payment" : currentStep;

  return (
    <CheckoutPagesLayout currentStep={stepperStep}>
      {children}
    </CheckoutPagesLayout>
  );
}
