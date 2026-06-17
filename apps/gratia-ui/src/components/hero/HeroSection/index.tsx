import Container from "@gratia/ui/components/Container/";
import {
  Bed,
  Camera,
  ChefHat,
  Dumbbell,
  Footprints,
  Gamepad2,
  Headphones,
  Tent,
} from "lucide-react";
import HeroBackground from "./HeroBackground";
import HeroCategoryGrid, {
  type HeroCategoryTileData,
} from "./HeroCategoryGrid";
import HeroCategoryStrip, {
  type QuickCategory,
} from "./HeroCategoryStrip";
import HeroContent from "./HeroContent";
import styles from "./HeroSection.module.scss";

export interface HeroFeaturedData {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  ctaVariant?: "primary" | "secondary" | "outlined" | "ghost";
  images: string[];
  imageAlt?: string;
  autoplayInterval?: number;
}

interface HeroSectionProps {
  featured?: HeroFeaturedData;
  categoryTiles?: HeroCategoryTileData[];
  quickCategories?: QuickCategory[];
}

const DEFAULT_FEATURED: HeroFeaturedData = {
  title: "Welcome to Gratia",
  description: "Electronics, fashion, home and more — all in one place.",
  ctaText: "Shop trending",
  ctaHref: "/products/collection/trending",
  ctaVariant: "primary",
  images: [
    "/images/hero-img-1.avif",
    "/images/hero-img-2.avif",
    "/images/hero-img-3.avif",
    "/images/hero-img-4.avif",
  ],
  imageAlt: "Hero Background",
  autoplayInterval: 5000,
};

const DEFAULT_CATEGORY_TILES: HeroCategoryTileData[] = [
  {
    label: "Electronics",
    tagline: "Phones, laptops, audio",
    imageSrc: "https://picsum.photos/seed/category-electronics/800/600",
    href: "/products/category/electronics",
  },
  {
    label: "Fashion",
    tagline: "Men, women, shoes",
    imageSrc: "https://picsum.photos/seed/category-fashion/800/600",
    href: "/products/category/fashion",
  },
  {
    label: "Home & Living",
    tagline: "Furniture, kitchen, decor",
    imageSrc: "https://picsum.photos/seed/category-home-living/800/600",
    href: "/products/category/home-living",
  },
  {
    label: "Books",
    tagline: "Fiction, science, kids",
    imageSrc: "https://picsum.photos/seed/category-books/800/600",
    href: "/products/category/books",
  },
];

const DEFAULT_QUICK_CATEGORIES: QuickCategory[] = [
  {
    label: "Sports",
    icon: Dumbbell,
    href: "/products/category/sports-outdoors",
  },
  {
    label: "Audio",
    icon: Headphones,
    href: "/products/category/audio",
  },
  {
    label: "Gaming",
    icon: Gamepad2,
    href: "/products/category/gaming",
  },
  {
    label: "Kitchen",
    icon: ChefHat,
    href: "/products/category/kitchen",
  },
  {
    label: "Cameras",
    icon: Camera,
    href: "/products/category/cameras",
  },
  {
    label: "Shoes",
    icon: Footprints,
    href: "/products/category/shoes",
  },
  {
    label: "Camping",
    icon: Tent,
    href: "/products/category/camping",
  },
  {
    label: "Bedding",
    icon: Bed,
    href: "/products/category/bedding",
  },
];

export default function HeroSection({
  featured = DEFAULT_FEATURED,
  categoryTiles = DEFAULT_CATEGORY_TILES,
  quickCategories = DEFAULT_QUICK_CATEGORIES,
}: HeroSectionProps) {
  return (
    <div className={styles.heroSectionContainer}>
      <Container className={styles.heroSectionContainerInner}>
        <div className={styles.heroSection}>
          <div className={styles.heroGrid}>
            <div className={styles.heroFeatured}>
              <div className={styles.heroFeaturedImage}>
                <HeroBackground
                  images={featured.images}
                  imageAlt={featured.imageAlt}
                  autoplayInterval={featured.autoplayInterval}
                />
                <div className={styles.heroFeaturedOverlay} />
              </div>
              <div className={styles.heroFeaturedContent}>
                <HeroContent
                  title={featured.title}
                  description={featured.description}
                  ctaText={featured.ctaText}
                  ctaHref={featured.ctaHref}
                  ctaVariant={featured.ctaVariant ?? "primary"}
                />
              </div>
            </div>

            <div className={styles.heroTiles}>
              <HeroCategoryGrid tiles={categoryTiles} />
            </div>
          </div>
        </div>
      </Container>

      {quickCategories.length > 0 ? (
        <HeroCategoryStrip categories={quickCategories} />
      ) : null}
    </div>
  );
}
