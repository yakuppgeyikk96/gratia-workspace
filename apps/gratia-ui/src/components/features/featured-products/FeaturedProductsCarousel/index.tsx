"use client";

import ProductCard from "@/components/features/product/ProductCard";
import { Product } from "@/types";
import { IconButton } from "@gratia/ui/components";
import { IconChevronLeft, IconChevronRight } from "@gratia/ui/icons";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import styles from "./FeaturedProductsCarousel.module.scss";

interface FeaturedProductsCarouselProps {
  products: Partial<Product>[];
  isLoggedIn: boolean;
}

export default function FeaturedProductsCarousel({
  products,
  isLoggedIn,
}: FeaturedProductsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 1024px)": { slidesToScroll: 4 },
      "(min-width: 768px)": { slidesToScroll: 3 },
      "(min-width: 640px)": { slidesToScroll: 2 },
      "(min-width: 480px)": { slidesToScroll: 1 },
    },
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
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

  const isProductValid = (product: Partial<Product>) => {
    return (
      product._id &&
      product.name &&
      product.price &&
      product.sku &&
      product.stock &&
      product.stock > 0
    );
  };

  const validProducts = products.filter(isProductValid);

  if (validProducts.length === 0) {
    return null;
  }

  return (
    <div className={styles.carouselWrapper}>
      <div className={styles.emblaViewport} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {validProducts.map((product) => (
            <div key={product._id} className={styles.emblaSlide}>
              <ProductCard
                product={product}
                isLoggedIn={isLoggedIn}
                className={styles.productCard}
              />
            </div>
          ))}
        </div>
      </div>

      {validProducts.length > 4 && (
        <>
          <IconButton
            className={`${styles.navButton} ${styles.navButtonPrev} ${
              !canScrollPrev ? styles.navButtonDisabled : ""
            }`}
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous products"
            icon={<IconChevronLeft size={24} />}
          />
          <IconButton
            className={`${styles.navButton} ${styles.navButtonNext} ${
              !canScrollNext ? styles.navButtonDisabled : ""
            }`}
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next products"
            icon={<IconChevronRight size={24} />}
          />
        </>
      )}
    </div>
  );
}
