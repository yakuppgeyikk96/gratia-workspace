import FeaturedProductsSection from "@/components/features/featured-products/FeaturedProductsSection";
import HeroSection from "@/components/features/hero/HeroSection";

export default async function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProductsSection />
    </>
  );
}
