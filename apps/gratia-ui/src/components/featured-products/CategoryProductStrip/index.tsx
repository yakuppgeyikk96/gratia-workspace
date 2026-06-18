"use client";

import ProductCard from "@/components/features/product/ProductCard";
import type { ProductListItem } from "@/types/Product.types";
import IconButton from "@gratia/ui/components/IconButton";
import IconChevronLeft from "@gratia/ui/icons/IconChevronLeft";
import IconChevronRight from "@gratia/ui/icons/IconChevronRight";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import styles from "./CategoryProductStrip.module.scss";

interface CategoryProductStripProps {
  title: string;
  viewAllHref: string;
  products: ProductListItem[];
  isLoggedIn: boolean;
}

export default function CategoryProductStrip({
  title,
  viewAllHref,
  products,
  isLoggedIn,
}: CategoryProductStripProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 1024px)": { slidesToScroll: 4 },
      "(min-width: 768px)": { slidesToScroll: 3 },
      "(min-width: 640px)": { slidesToScroll: 2 },
    },
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

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

  if (products.length === 0) return null;

  return (
    <section className={styles.strip}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <Link href={viewAllHref} prefetch={false} className={styles.viewAll}>
          View all
          <IconChevronRight size={16} />
        </Link>
      </header>

      <div className={styles.carouselWrapper}>
        <div className={styles.emblaViewport} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {products.map((product) => (
              <div key={product.id} className={styles.emblaSlide}>
                <ProductCard
                  product={product}
                  isLoggedIn={isLoggedIn}
                  className={styles.productCard}
                />
              </div>
            ))}
          </div>
        </div>

        {products.length > 4 && (
          <>
            <IconButton
              className={`${styles.navButton} ${styles.navButtonPrev} ${
                !canScrollPrev ? styles.navButtonDisabled : ""
              }`}
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label={`Previous ${title} products`}
              icon={<IconChevronLeft size={24} />}
            />
            <IconButton
              className={`${styles.navButton} ${styles.navButtonNext} ${
                !canScrollNext ? styles.navButtonDisabled : ""
              }`}
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label={`Next ${title} products`}
              icon={<IconChevronRight size={24} />}
            />
          </>
        )}
      </div>
    </section>
  );
}
