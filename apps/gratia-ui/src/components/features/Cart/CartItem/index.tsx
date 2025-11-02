import { CartItem as CartItemType } from "@/types/Cart.types";
import styles from "./CartItem.module.scss";
import CartItemContent from "./CartItemContent";
import CartItemImage from "./CartItemImage";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  // Calculate total price based on quantity
  const totalPrice = item.discountedPrice
    ? item.discountedPrice * item.quantity
    : item.price * item.quantity;

  return (
    <div className={styles.cartItem}>
      <CartItemImage
        images={item.productImages}
        productName={item.productName}
      />
      <CartItemContent
        productName={item.productName}
        quantity={item.quantity}
        totalPrice={totalPrice}
        price={item.price}
        discountedPrice={item.discountedPrice}
      />
    </div>
  );
}
