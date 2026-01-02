import Logo from "@/components/common/Logo";
import { CheckoutSession, CheckoutStep } from "@/types/Checkout.types";
import CheckoutStepper from "../CheckoutStepper";
import OrderSummary from "../OrderSummary";
import styles from "./CheckoutPagesLayout.module.scss";

interface CheckoutPagesLayoutProps {
  children: React.ReactNode;
  currentStep: CheckoutStep;
  session: CheckoutSession;
}

const CheckoutPagesLayout = ({
  children,
  currentStep,
  session,
}: CheckoutPagesLayoutProps) => {
  return (
    <div className={styles.checkoutPagesLayout}>
      <div className={styles.checkoutPagesHeader}>
        <Logo />
      </div>
      <CheckoutStepper currentStep={currentStep} />

      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>{children}</div>
        <aside className={styles.sidebar}>
          <OrderSummary session={session} sticky />
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPagesLayout;
