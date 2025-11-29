import { getCheckoutSessionFromCookie } from "@/actions/checkout";
import CheckoutShipping from "@/components/features/checkout/CheckoutShipping";
import { CheckoutStep } from "@/types/Checkout.types";
import { redirect } from "next/navigation";

interface CheckoutPageProps {
  searchParams: Promise<{
    step?: string;
  }>;
}

const CheckoutPage = async ({ searchParams }: CheckoutPageProps) => {
  const { step } = await searchParams;

  const sessionResponse = await getCheckoutSessionFromCookie();

  if (!sessionResponse.success || !sessionResponse.data) {
    redirect("/cart?error=session_expired");
  }

  const session = sessionResponse.data;
  const urlStep = (step || session.currentStep) as CheckoutStep;

  switch (urlStep) {
    case "shipping":
      return <CheckoutShipping session={session} />;

    case "shipping_method":
      // TODO: CheckoutShippingMethod component
      return <div>Shipping Method - Coming soon</div>;

    case "payment":
      // TODO: CheckoutPayment component
      return <div>Payment - Coming soon</div>;

    case "completed":
      if (session.orderId) {
        redirect(`/order/confirmation?orderId=${session.orderId}`);
      }
      redirect("/cart");

    default:
      redirect(`/checkout?step=${session.currentStep}`);
  }
};

export default CheckoutPage;
