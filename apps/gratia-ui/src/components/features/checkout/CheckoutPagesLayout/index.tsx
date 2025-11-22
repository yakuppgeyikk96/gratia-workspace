import Logo from "@/components/common/Logo";
import CheckoutStepper from "../CheckoutStepper";
import styles from "./CheckoutPagesLayout.module.scss";

interface CheckoutPagesLayoutProps {
  children: React.ReactNode;
}

const CheckoutPagesLayout = ({ children }: CheckoutPagesLayoutProps) => {
  return (
    <div className={styles.checkoutPagesLayout}>
      <div className={styles.checkoutPagesHeader}>
        <Logo />
      </div>
      <CheckoutStepper currentStep="shipping" />
      {children}
    </div>
  );
};

export default CheckoutPagesLayout;
