import Logo from "@/components/common/Logo";
import { CheckoutStep } from "@/types/Checkout.types";
import CheckoutStepper from "../CheckoutStepper";
import styles from "./CheckoutPagesLayout.module.scss";

interface CheckoutPagesLayoutProps {
  children: React.ReactNode;
  currentStep: CheckoutStep;
}

const CheckoutPagesLayout = ({
  children,
  currentStep,
}: CheckoutPagesLayoutProps) => {
  return (
    <div className={styles.checkoutPagesLayout}>
      <div className={styles.checkoutPagesHeader}>
        <Logo />
      </div>
      <CheckoutStepper currentStep={currentStep} />
      {children}
    </div>
  );
};

export default CheckoutPagesLayout;
