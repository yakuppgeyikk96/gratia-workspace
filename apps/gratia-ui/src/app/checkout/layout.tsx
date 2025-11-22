import CheckoutPagesLayout from "@/components/features/checkout/CheckoutPagesLayout";

const CheckoutLayout = ({ children }: { children: React.ReactNode }) => {
  return <CheckoutPagesLayout>{children}</CheckoutPagesLayout>;
};

export default CheckoutLayout;
