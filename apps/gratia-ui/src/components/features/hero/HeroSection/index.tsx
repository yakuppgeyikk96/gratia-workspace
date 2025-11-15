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
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop&q=80", // Fashion retail
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=1080&fit=crop&q=80", // Fashion portrait
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&h=1080&fit=crop&q=80", // Fashion clothing rack
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&h=1080&fit=crop&q=80", // Fashion outfit
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop&q=80", // Fashion accessories
        ]);

  return (
    <div className={styles.heroSection}>
      <HeroBackground
        images={heroImages}
        imageAlt={imageAlt}
        autoplayInterval={autoplayInterval}
      />
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
  );
}
