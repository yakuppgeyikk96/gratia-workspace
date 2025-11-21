import ProductDetailImageGallery from "@/components/features/product/ProductDetailImageGallery";
import ProductDetailInfoCard from "@/components/features/product/ProductDetailInfoCard";
import { ProductWithVariantsDto } from "@/types/Product.types";
import { notFound } from "next/navigation";
import styles from "./ProductDetailPage.module.scss";

interface ProductDetailPageProps {
  productData: ProductWithVariantsDto;
  isLoggedIn: boolean;
}

export default function ProductDetailPage({
  productData,
  isLoggedIn,
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
        <ProductDetailInfoCard
          productData={productData}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
}
