import FeaturedProductsSection from "@/components/featured-products/FeaturedProductsSection";
import HeroSection from "@/components/hero/HeroSection";

export default async function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProductsSection />
    </>
  );
}
