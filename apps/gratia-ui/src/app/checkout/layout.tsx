import { getCheckoutSessionData } from "@/actions/checkout";
import CheckoutPagesLayout from "@/components/features/checkout/CheckoutPagesLayout";
import { CheckoutStep } from "@/types/Checkout.types";
import { redirect } from "next/navigation";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionResponse = await getCheckoutSessionData();

  if (!sessionResponse.success || !sessionResponse.data) {
    redirect("/cart");
  }

  const session = sessionResponse.data;
  const currentStep = session.currentStep;

  const stepperStep: Exclude<CheckoutStep, "completed"> =
    currentStep === "completed" ? "payment" : currentStep;

  return (
    <CheckoutPagesLayout currentStep={stepperStep} session={session}>
      {children}
    </CheckoutPagesLayout>
  );
}
