import dynamic from "next/dynamic";

const HeroSection = dynamic(() => import("@/components/hero/HeroSection"), {
  ssr: true,
});
const FeaturedProductsSection = dynamic(
  () => import("@/components/featured-products/FeaturedProductsSection"),
  {
    ssr: true,
  }
);

export default async function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProductsSection />
    </>
  );
}
