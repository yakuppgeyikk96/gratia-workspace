"use client";

import Image from "next/image";
import styles from "./CartItemImage.module.scss";

interface CartItemImageProps {
  images: string[];
  productName: string;
}

export default function CartItemImage({
  images,
  productName,
}: CartItemImageProps) {
  const hasImages = images && images.length > 0;
  const firstImage = hasImages ? images[0] : null;

  return (
    <div className={styles.imageContainer}>
      {firstImage ? (
        <div className={styles.imageWrapper}>
          <Image
            src={firstImage}
            alt={productName}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 120px, 120px"
            fetchPriority="high"
          />
        </div>
      ) : (
        <div className={styles.placeholderImage}>
          <span className={styles.placeholderText}>No Image</span>
        </div>
      )}
    </div>
  );
}
