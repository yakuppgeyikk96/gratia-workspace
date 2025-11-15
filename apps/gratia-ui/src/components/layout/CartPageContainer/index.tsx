import { isAuthenticatedUser } from "@/actions";
import { CartList } from "@/components/features/cart";
import styles from "./CartPageContainer.module.scss";

export default async function CartPageContainer() {
  const isLoggedIn = await isAuthenticatedUser();
  return (
    <div className={styles.cartPageContainer}>
      <div className={styles.cartList}>
        <CartList isLoggedIn={isLoggedIn} />
      </div>
      <div className={styles.totalPrice}>
        <h2>Total Price</h2>
      </div>
    </div>
  );
}
