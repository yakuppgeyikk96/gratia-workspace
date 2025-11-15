"use client";

import { useEmblaAutoplay } from "@/hooks/useEmblaAutoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
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

  useEmblaAutoplay({
    emblaApi,
    interval: autoplayInterval,
    enabled: images.length > 1,
  });

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={styles.heroBackground}>
      <div className={styles.emblaViewport} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {images.map((imageSrc, index) => (
            <div key={index} className={styles.emblaSlide}>
              <Image
                src={imageSrc}
                alt={`${imageAlt} - Slide ${index + 1}`}
                fill
                priority={index === 0}
                className={styles.backgroundImage}
                sizes="100vw"
              />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.heroOverlay} />
    </div>
  );
}
