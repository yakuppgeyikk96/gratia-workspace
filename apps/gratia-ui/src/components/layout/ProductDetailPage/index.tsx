import ProductDetailImageGallery from "@/components/features/product/ProductDetailImageGallery";
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
        <h1>{productData.product.name}</h1>
        <p>{productData.product.description}</p>
      </div>
    </div>
  );
}
