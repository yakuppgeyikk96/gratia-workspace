import { ProductDetailResponse } from "@/types/Product.types";
import ProductDetailAddToCart from "../ProductDetailAddToCart";
import ProductDetailPrice from "../ProductDetailPrice";
import styles from "./ProductDetailMobilePurchaseBar.module.scss";

interface ProductDetailMobilePurchaseBarProps {
  productData: ProductDetailResponse;
  isLoggedIn: boolean;
}

export default function ProductDetailMobilePurchaseBar({
  productData,
  isLoggedIn,
}: ProductDetailMobilePurchaseBarProps) {
  return (
    <div className={styles.bar} aria-label="Mobile purchase bar">
      <div className={styles.priceWrap}>
        <ProductDetailPrice
          price={productData.price}
          discountedPrice={productData.discountedPrice}
          currency="USD"
        />
      </div>
      <div className={styles.cta}>
        <ProductDetailAddToCart product={productData} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
