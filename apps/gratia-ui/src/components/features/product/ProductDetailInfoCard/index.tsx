import { ProductDetailResponse } from "@/types/Product.types";
import ProductDetailAddToCart from "../ProductDetailAddToCart";
import ProductDetailPrice from "../ProductDetailPrice";
import ProductVariantSelector from "../ProductVariantSelector";
import styles from "./ProductDetailInfoCard.module.scss";

interface ProductDetailInfoCardProps {
  productData: ProductDetailResponse;
  isLoggedIn: boolean;
}

export default function ProductDetailInfoCard({
  productData,
  isLoggedIn,
}: ProductDetailInfoCardProps) {
  const availableOptions = productData.availableOptions;

  // Get variant types that have multiple options (size, color)
  const variantTypes = Object.keys(availableOptions).filter(
    (key) =>
      (key === "size" || key === "color") && availableOptions[key].length > 1
  );

  return (
    <div className={styles.productDetailInfoCard}>
      <div className={styles.productDetailInfoCardHeader}>
        <h1>{productData.name}</h1>
        <p>{productData.description}</p>
      </div>

      <ProductDetailPrice
        price={productData.price}
        discountedPrice={productData.discountedPrice}
        currency="USD"
      />

      {variantTypes.map((variantKey) => {
        const variantType = variantKey as "size" | "color";
        const currentValue = productData.attributes[variantKey];

        if (!currentValue) {
          return null;
        }

        return (
          <ProductVariantSelector
            key={variantKey}
            variantType={variantType}
            currentProduct={productData}
            variants={productData.variants}
            currency="USD"
          />
        );
      })}

      <ProductDetailAddToCart product={productData} isLoggedIn={isLoggedIn} />
    </div>
  );
}
