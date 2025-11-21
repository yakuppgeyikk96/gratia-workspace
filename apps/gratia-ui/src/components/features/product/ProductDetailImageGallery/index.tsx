"use client";

import { IconChevronLeft, IconChevronRight } from "@gratia/ui/icons";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import styles from "./ProductDetailImageGallery.module.scss";

interface ProductDetailImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductDetailImageGallery({
  images,
  productName,
}: ProductDetailImageGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const hasImages = images.length > 0;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  if (!hasImages) {
    return (
      <div className={styles.galleryContainer}>
        <div className={styles.placeholderImage}>
          <span className={styles.placeholderText}>No Image</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.galleryContainer}>
      {/* Main Image Carousel */}
      <div className={styles.mainCarousel}>
        <div className={styles.emblaViewport} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {images.map((image, index) => (
              <div key={index} className={styles.emblaSlide}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={image}
                    alt={`${productName} - Image ${index + 1}`}
                    fill
                    className={styles.image}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 60vw, (max-width: 1024px) 42vw, (max-width: 1280px) 42vw, 33vw"
                    priority={index === 0}
                    quality={75}
                    loading={index === 0 ? undefined : "lazy"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.navButton} ${styles.navButtonPrev} ${
                !canScrollPrev ? styles.navButtonDisabled : ""
              }`}
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous image"
            >
              <IconChevronLeft size={20} />
            </button>
            <button
              type="button"
              className={`${styles.navButton} ${styles.navButtonNext} ${
                !canScrollNext ? styles.navButtonDisabled : ""
              }`}
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next image"
            >
              <IconChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className={styles.thumbnailContainer}>
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.thumbnail} ${
                index === selectedIndex ? styles.thumbnailActive : ""
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`View image ${index + 1}`}
            >
              <div className={styles.thumbnailImageWrapper}>
                <Image
                  src={image}
                  alt={`${productName} - Thumbnail ${index + 1}`}
                  fill
                  className={styles.thumbnailImage}
                  sizes="80px"
                  quality={60}
                  loading="lazy"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
