import { ProductWithVariantsDto } from "@/types/Product.types";
import ProductDetailAddToCart from "../ProductDetailAddToCart";
import ProductDetailPrice from "../ProductDetailPrice";
import ProductVariantSelector from "../ProductVariantSelector";
import styles from "./ProductDetailInfoCard.module.scss";

interface ProductDetailInfoCardProps {
  productData: ProductWithVariantsDto;
  isLoggedIn: boolean;
}
export default function ProductDetailInfoCard({
  productData,
  isLoggedIn,
}: ProductDetailInfoCardProps) {
  return (
    <div className={styles.productDetailInfoCard}>
      <div className={styles.productDetailInfoCardHeader}>
        <h1>{productData.product.name}</h1>
        <p>{productData.product.description}</p>
      </div>

      <ProductDetailPrice
        price={productData.product.price}
        discountedPrice={productData.product.discountedPrice}
        currency="USD"
      />

      {productData.product.attributes.size &&
        productData.availableOptions.sizes.length > 0 && (
          <ProductVariantSelector
            variantType="size"
            currentProduct={productData.product}
            variants={productData.variants}
            currency="USD"
          />
        )}

      {productData.product.attributes.color &&
        productData.availableOptions.colors.length > 0 && (
          <ProductVariantSelector
            variantType="color"
            currentProduct={productData.product}
            variants={productData.variants}
            currency="USD"
          />
        )}

      <ProductDetailAddToCart
        product={productData.product}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
