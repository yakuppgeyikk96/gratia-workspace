import { isAuthenticatedUser } from "@/actions/auth";
import { getProducts } from "@/actions/product";
import Container from "@gratia/ui/components/Container";

import CategoryProductStrip from "../CategoryProductStrip";
import styles from "./FeaturedProductsSection.module.scss";

interface FeaturedCategory {
  title: string;
  categorySlug: string;
  viewAllHref: string;
}

const FEATURED_CATEGORIES: FeaturedCategory[] = [
  {
    title: "Top in Electronics",
    categorySlug: "electronics",
    viewAllHref: "/products/category/electronics",
  },
  {
    title: "Top in Fashion",
    categorySlug: "fashion",
    viewAllHref: "/products/category/fashion",
  },
  {
    title: "Top in Home & Living",
    categorySlug: "home-living",
    viewAllHref: "/products/category/home-living",
  },
  {
    title: "Top in Books",
    categorySlug: "books",
    viewAllHref: "/products/category/books",
  },
];

const STRIP_LIMIT = 10;

export default async function FeaturedProductsSection() {
  const [isLoggedIn, ...stripResponses] = await Promise.all([
    isAuthenticatedUser(),
    ...FEATURED_CATEGORIES.map((cat) =>
      getProducts({
        categorySlug: cat.categorySlug,
        sort: "newest",
        limit: STRIP_LIMIT,
      }),
    ),
  ]);

  const strips = FEATURED_CATEGORIES.map((cat, idx) => ({
    config: cat,
    products: stripResponses[idx]?.data?.products ?? [],
  })).filter((s) => s.products.length > 0);

  if (strips.length === 0) return null;

  return (
    <section className={styles.featuredProductsSection}>
      <Container className={styles.container}>
        {strips.map(({ config, products }) => (
          <CategoryProductStrip
            key={config.categorySlug}
            title={config.title}
            viewAllHref={config.viewAllHref}
            products={products}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </Container>
    </section>
  );
}
