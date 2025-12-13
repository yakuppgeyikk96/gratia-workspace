import { isAuthenticatedUser } from "@/actions/auth";
import { getFeaturedProducts } from "@/actions/product";
import { Container } from "@gratia/ui/components";
import { Suspense } from "react";
import FeaturedProductsCarousel from "../FeaturedProductsCarousel";
import FeaturedProductsSkeleton from "../FeaturedProductsSkeleton";
import styles from "./FeaturedProductsSection.module.scss";

export default async function FeaturedProductsSection() {
  const [productsResponse, isLoggedIn] = await Promise.all([
    getFeaturedProducts(),
    isAuthenticatedUser(),
  ]);

  if (!productsResponse.success || !productsResponse.data) {
    return null;
  }

  const products = productsResponse.data;

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={styles.featuredProductsSection}>
      <Container className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Featured Products</h2>
          <p className={styles.subtitle}>
            Discover our handpicked selection of premium items
          </p>
        </div>

        <Suspense fallback={<FeaturedProductsSkeleton />}>
          <FeaturedProductsCarousel
            products={products}
            isLoggedIn={isLoggedIn}
          />
        </Suspense>
      </Container>
    </section>
  );
}
