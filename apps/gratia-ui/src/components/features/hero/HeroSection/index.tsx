import { Container } from "@gratia/ui/components";
import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";
import styles from "./HeroSection.module.scss";

interface HeroSectionProps {
  images?: string[];
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaVariant?: "primary" | "secondary" | "outlined" | "ghost";
  autoplayInterval?: number;
}

export default function HeroSection({
  images,
  imageSrc,
  imageAlt = "Hero Background",
  title = "Welcome to Gratia",
  description = "Discover the latest trends in fashion and style",
  ctaText = "Shop Now",
  ctaHref = "/products/collection/trending",
  ctaVariant = "primary",
  autoplayInterval = 5000,
}: HeroSectionProps) {
  const heroImages =
    images ||
    (imageSrc
      ? [imageSrc]
      : [
          "/images/hero-img-1.avif",
          "/images/hero-img-2.avif",
          "/images/hero-img-3.avif",
          "/images/hero-img-4.avif",
        ]);

  return (
    <div className={styles.heroSectionContainer}>
      <div className={styles.heroSection}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContentWrapper}>
            <Container className={styles.heroContainer}>
              <HeroContent
                title={title}
                description={description}
                ctaText={ctaText}
                ctaHref={ctaHref}
                ctaVariant={ctaVariant}
              />
            </Container>
          </div>

          <div className={styles.heroImageWrapper}>
            <HeroBackground
              images={heroImages}
              imageAlt={imageAlt}
              autoplayInterval={autoplayInterval}
            />
            <div className={styles.heroGradientOverlay} />
          </div>
        </div>
      </div>
    </div>
  );
}
