import { FeaturedProductsSection } from "@/components/featured-products";
import { HeroSection } from "@/components/hero";

export default async function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProductsSection />
    </>
  );
}
