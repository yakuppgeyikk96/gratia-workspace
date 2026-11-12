"use client";

import WishlistButton from "@/components/features/wishlist/WishlistButton";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProductCardImageProps } from "../ProductCard.types";
import styles from "./ProductCardImage.module.scss";

export default function ProductCardImage({
  images,
  productName,
  productId,
  isLoggedIn,
  priority = false,
}: ProductCardImageProps) {
  // The slider is native horizontal scrolling with CSS scroll-snap, so it needs
  // no carousel library: JS only tracks which slide is in view.
  const viewportRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

  const displayImages = useMemo(() => images.slice(0, 4), [images]);
  const hasImages = displayImages.length > 0;
  const slideCount = displayImages.length;

  // Cards also sit inside drag carousels (e.g. the homepage product strips).
  // Keep a swipe on the images from reaching such a parent, otherwise it would
  // drag the whole strip and cancel the native scroll of this slider.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || slideCount < 2) return;

    const stopPropagation = (event: TouchEvent): void => {
      event.stopPropagation();
    };

    viewport.addEventListener("touchstart", stopPropagation, { passive: true });
    return () => {
      viewport.removeEventListener("touchstart", stopPropagation);
    };
  }, [slideCount]);

  const handleScroll = useCallback((): void => {
    const viewport = viewportRef.current;
    if (!viewport || viewport.clientWidth === 0) return;

    const newIndex = Math.min(
      slideCount - 1,
      Math.max(0, Math.round(viewport.scrollLeft / viewport.clientWidth)),
    );

    setSelectedIndex(newIndex);

    // Load current and next image when sliding
    setLoadedImages((prev) => {
      const nextIndex = newIndex + 1;
      const needsNext = nextIndex < slideCount && !prev.has(nextIndex);
      if (prev.has(newIndex) && !needsNext) return prev;

      const newSet = new Set(prev);
      newSet.add(newIndex);
      if (needsNext) newSet.add(nextIndex);
      return newSet;
    });
  }, [slideCount]);

  const scrollTo = useCallback((index: number): void => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      left: index * viewport.clientWidth,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className={styles.imageContainer}>
      {/* Image Display */}
      {hasImages ? (
        <div
          className={styles.sliderViewport}
          ref={viewportRef}
          onScroll={handleScroll}
        >
          {displayImages.map((image, index) => {
            const shouldLoad = loadedImages.has(index);
            const isEager = priority && index === 0;

            return (
              <div key={index} className={styles.slide}>
                <div className={styles.imageWrapper}>
                  {shouldLoad ? (
                    <Image
                      src={image}
                      alt={`${productName} - Image ${index + 1}`}
                      fill
                      className={styles.image}
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 280px"
                      quality={70}
                      priority={isEager}
                      loading={isEager ? undefined : "lazy"}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.placeholderImage}>
          <span className={styles.placeholderText}>No Image</span>
        </div>
      )}

      {/* Wishlist Button */}
      <div className={styles.favoriteButton}>
        <WishlistButton
          productId={productId}
          isLoggedIn={isLoggedIn}
          size="sm"
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
