import { cookies } from "next/headers";

const CheckoutPage = async () => {
  const cookieStore = await cookies();

  const checkoutSessionToken = cookieStore.get(
    "gratia-checkout-session"
  )?.value;

  if (!checkoutSessionToken) {
    return <div>Checkout session not found</div>;
  }

  return <div>{checkoutSessionToken}</div>;
};

export default CheckoutPage;
