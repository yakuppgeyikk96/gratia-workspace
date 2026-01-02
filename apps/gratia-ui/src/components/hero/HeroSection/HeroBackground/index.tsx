"use client";

import { useEmblaAutoplay } from "@/hooks/useEmblaAutoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./HeroBackground.module.scss";

interface HeroBackgroundProps {
  images: string[];
  imageAlt?: string;
  autoplayInterval?: number;
}

export default function HeroBackground({
  images,
  imageAlt = "Hero Background",
  autoplayInterval = 5000,
}: HeroBackgroundProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 20,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEmblaAutoplay({
    emblaApi,
    interval: autoplayInterval,
    enabled: images.length > 1,
  });

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={styles.heroBackground}>
      <div className={styles.emblaViewport} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {images.map((imageSrc, index) => (
            <div
              key={index}
              className={styles.emblaSlide}
              data-embla-selected={index === selectedIndex ? "" : undefined}
            >
              <Image
                src={imageSrc}
                alt={`${imageAlt} - Slide ${index + 1}`}
                fill
                priority={index === 0}
                className={styles.backgroundImage}
                sizes="50vw"
                fetchPriority={index === 0 ? "high" : "auto"}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
