import styles from "./ProductDetailSkeleton.module.scss";

export default function ProductDetailSkeleton() {
  return (
    <div className={styles.productDetailContainer}>
      <div className={styles.imageGalleryContainer}>
        <div className={styles.galleryWrapper}>
          <div className={styles.mainImageSkeleton} />
          <div className={styles.thumbnailContainer}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.thumbnailSkeleton} />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.productInfoContainer}>
        <div className={styles.infoCard}>
          <div className={styles.headerSection}>
            <div className={styles.titleSkeleton} />
            <div className={styles.descriptionSkeleton} />
            <div className={styles.descriptionSkeletonShort} />
          </div>

          <div className={styles.priceSection}>
            <div className={styles.priceSkeleton} />
            <div className={styles.originalPriceSkeleton} />
          </div>

          <div className={styles.variantSection}>
            <div className={styles.variantLabelSkeleton} />
            <div className={styles.variantOptions}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.variantOptionSkeleton} />
              ))}
            </div>
          </div>

          <div className={styles.variantSection}>
            <div className={styles.variantLabelSkeleton} />
            <div className={styles.variantOptions}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.variantOptionSkeleton} />
              ))}
            </div>
          </div>

          <div className={styles.buttonSkeleton} />
        </div>
      </div>
    </div>
  );
}
