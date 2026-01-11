import styles from "./CartItemContent.module.scss";

interface CartItemContentProps {
  productName: string;
  quantity: number;
  totalPrice: number;
  price: number;
  discountedPrice?: number;
}

export default function CartItemContent({
  productName,
  quantity,
  totalPrice,
  price,
  discountedPrice,
}: CartItemContentProps) {
  const hasDiscount = discountedPrice !== undefined && discountedPrice < price;
  const unitPrice = hasDiscount ? discountedPrice! : price;

  return (
    <div className={styles.contentContainer}>
      <div className={styles.infoSection}>
        <h3 className={styles.productName}>{productName}</h3>
        <div className={styles.priceInfo}>
          <span className={styles.unitPrice}>
            ${unitPrice}
            {quantity > 1 && (
              <span className={styles.quantity}> × {quantity}</span>
            )}
          </span>
          {hasDiscount && (
            <span className={styles.originalUnitPrice}>${price}</span>
          )}
          <span className={styles.totalPrice}>${totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
