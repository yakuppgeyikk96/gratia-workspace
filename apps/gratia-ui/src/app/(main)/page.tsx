import TrustBar from "@/components/common/TrustBar";
import FeaturedProductsSection from "@/components/featured-products/FeaturedProductsSection";
import HeroSection from "@/components/hero/HeroSection";
import BrandStripSection from "@/components/homepage-brands/BrandStripSection";
import HomepageCollectionsSection from "@/components/homepage-collections/HomepageCollectionsSection";

export default async function Home() {
  return (
    <>
      <HeroSection />
      <HomepageCollectionsSection />
      <FeaturedProductsSection />
      <BrandStripSection />
      <TrustBar />
    </>
  );
}
