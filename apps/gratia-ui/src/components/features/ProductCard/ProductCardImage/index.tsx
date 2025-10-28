"use client";

import { COLORS } from "@/constants/colors";
import { IconButton } from "@gratia/ui/components";
import { IconHeart } from "@gratia/ui/icons";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ProductCardImageProps } from "../ProductCard.types";
import styles from "./ProductCardImage.module.scss";

export default function ProductCardImage({
  images,
  productName,
  onAddToFavorites,
}: ProductCardImageProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // En fazla 4 görsel göster
  const displayImages = images.slice(0, 4);
  const hasImages = displayImages.length > 0;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const handleFavoriteClick = () => {
    onAddToFavorites?.();
  };

  return (
    <div className={styles.imageContainer}>
      {/* Image Display */}
      {hasImages ? (
        <div className={styles.emblaViewport} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {displayImages.map((image, index) => (
              <div key={index} className={styles.emblaSlide}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={image}
                    alt={`${productName} - Image ${index + 1}`}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    priority={index === 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.placeholderImage}>
          <span className={styles.placeholderText}>No Image</span>
        </div>
      )}

      {/* Favorite Button */}
      <div className={styles.favoriteButton}>
        <IconButton
          icon={<IconHeart color={COLORS.ICON_DEFAULT} size={18} />}
          size="sm"
          onClick={handleFavoriteClick}
          ariaLabel="Add to favorites"
        />
      </div>

      {/* Navigation Dots */}
      {hasImages && displayImages.length > 1 && (
        <div className={styles.dotsContainer}>
          {displayImages.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${
                index === selectedIndex ? styles.dotActive : ""
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
