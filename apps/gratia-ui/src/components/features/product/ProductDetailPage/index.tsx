import ProductDetailInfoCard from "@/components/features/product/ProductDetailInfoCard";
import { ProductDetailResponse } from "@/types/Product.types";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import ProductSpecifications from "../ProductSpecifications";
import styles from "./ProductDetailPage.module.scss";

const ProductDetailImageGallery = dynamic(
  () =>
    import("@/components/features/product/ProductDetailImageGallery").then(
      (mod) => mod.default,
    ),
  {
    ssr: true,
  },
);

interface ProductDetailPageProps {
  productData: ProductDetailResponse;
  isLoggedIn: boolean;
}

export default function ProductDetailPage({
  productData,
  isLoggedIn,
}: ProductDetailPageProps) {
  if (!productData) {
    notFound();
  }

  return (
    <div className={styles.productDetailContainer}>
      <div className={styles.imageGalleryContainer}>
        <ProductDetailImageGallery
          images={productData.images}
          productName={productData.name}
        />
      </div>

      <div className={styles.productInfoContainer}>
        <ProductDetailInfoCard
          productData={productData}
          isLoggedIn={isLoggedIn}
        />
      </div>

      <div className={styles.productSpecificationsContainer}>
        <ProductSpecifications attributes={productData.attributes} />
      </div>
    </div>
  );
}
