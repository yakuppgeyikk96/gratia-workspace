"use client";

import { COLORS } from "@/constants/colors";
import IconButton from "@gratia/ui/components/IconButton";
import IconHeart from "@gratia/ui/icons/IconHeart";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProductCardImageProps } from "../ProductCard.types";
import styles from "./ProductCardImage.module.scss";

export default function ProductCardImage({
  images,
  productName,
  onAddToFavorites,
}: ProductCardImageProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

  const displayImages = useMemo(() => images.slice(0, 4), [images]);
  const hasImages = displayImages.length > 0;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);

    // Load current and next image when sliding
    setLoadedImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(newIndex);
      if (newIndex + 1 < displayImages.length) {
        newSet.add(newIndex + 1);
      }
      return newSet;
    });
  }, [emblaApi, displayImages.length]);

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
            {displayImages.map((image, index) => {
              const shouldLoad = loadedImages.has(index);

              return (
                <div key={index} className={styles.emblaSlide}>
                  <div className={styles.imageWrapper}>
                    {shouldLoad ? (
                      <Image
                        src={image}
                        alt={`${productName} - Image ${index + 1}`}
                        fill
                        className={styles.image}
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 280px"
                        quality={70}
                        priority={index === 0}
                        loading={index === 0 ? undefined : "lazy"}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder} />
                    )}
                  </div>
                </div>
              );
            })}
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
