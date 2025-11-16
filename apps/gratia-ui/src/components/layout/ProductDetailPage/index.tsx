import ProductDetailImageGallery from "@/components/features/product/ProductDetailImageGallery";
import ProductDetailPrice from "@/components/features/product/ProductDetailPrice";
import ProductVariantSelector from "@/components/features/product/ProductVariantSelector";
import { ProductWithVariantsDto } from "@/types/Product.types";
import { notFound } from "next/navigation";
import styles from "./ProductDetailPage.module.scss";

interface ProductDetailPageProps {
  productData: ProductWithVariantsDto;
}

export default function ProductDetailPage({
  productData,
}: ProductDetailPageProps) {
  if (!productData?.product) {
    notFound();
  }

  return (
    <div className={styles.productDetailContainer}>
      <div className={styles.imageGalleryContainer}>
        <ProductDetailImageGallery
          images={productData.product.images}
          productName={productData.product.name}
        />
      </div>

      <div className={styles.productInfoContainer}>
        <div className={styles.productInfoHeader}>
          <h1>{productData.product.name}</h1>
          <p>{productData.product.description}</p>
        </div>

        <ProductDetailPrice
          price={productData.product.price}
          discountedPrice={productData.product.discountedPrice}
          currency="USD"
        />

        {/* Variant Selectors */}
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
      </div>
    </div>
  );
}
