import { getCheckoutSessionData } from "@/actions/checkout";
import { CheckoutStep } from "@/types/Checkout.types";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

const CheckoutPayment = dynamic(
  () => import("@/components/features/checkout/CheckoutPayment"),
  {
    ssr: true,
  },
);

const CheckoutShipping = dynamic(
  () => import("@/components/features/checkout/CheckoutShipping"),
  {
    ssr: true,
  },
);

const CheckoutShippingMethod = dynamic(
  () => import("@/components/features/checkout/CheckoutShippingMethod"),
  {
    ssr: true,
  },
);

interface CheckoutPageProps {
  searchParams: Promise<{
    step?: string;
  }>;
}

const CheckoutPage = async ({ searchParams }: CheckoutPageProps) => {
  const { step } = await searchParams;

  const sessionResponse = await getCheckoutSessionData();

  if (!sessionResponse.success || !sessionResponse.data) {
    redirect("/cart?error=session_expired");
  }

  const session = sessionResponse.data;
  const urlStep = (step || session.currentStep) as CheckoutStep;

  switch (urlStep) {
    case "shipping":
      return (
        <CheckoutShipping
          shippingAddress={session.shippingAddress}
          billingAddress={session.billingAddress}
        />
      );

    case "shipping_method":
      return (
        <CheckoutShippingMethod shippingMethodId={session.shippingMethodId} />
      );

    case "payment":
      return <CheckoutPayment />;

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
