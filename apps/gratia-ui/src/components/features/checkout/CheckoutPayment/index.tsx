"use client";

import { CheckoutSession } from "@/types";
// ... diğer imports
import StripeElementsProvider from "@/components/providers/StripeElementsProvider";

export default function CheckoutPayment({
  session,
}: {
  session: CheckoutSession;
}) {
  console.log(session);
  return (
    <StripeElementsProvider>
      {/* Payment form burada olacak */}
      <div>Payment form will be here</div>
    </StripeElementsProvider>
  );
}
