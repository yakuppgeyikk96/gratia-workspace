import { getActiveBrands } from "@/actions/brand";
import Container from "@gratia/ui/components/Container";
import Image from "next/image";
import Link from "next/link";

import styles from "./BrandStripSection.module.scss";

const BRAND_DISPLAY_LIMIT = 16;

export default async function BrandStripSection() {
  const response = await getActiveBrands();

  if (!response.success || !response.data || response.data.length === 0) {
    return null;
  }

  const brands = response.data
    .filter((b) => b.logo)
    .slice(0, BRAND_DISPLAY_LIMIT);

  if (brands.length === 0) return null;

  return (
    <section className={styles.section}>
      <Container className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>Shop your favorite brands</h2>
          <Link href="/products" prefetch={false} className={styles.viewAll}>
            Browse all
          </Link>
        </header>

        <div className={styles.scroller}>
          <ul className={styles.list}>
            {brands.map((brand) => (
              <li key={brand.id} className={styles.item}>
                <Link
                  href={`/products?filters[brandSlugs]=${brand.slug}`}
                  prefetch={false}
                  className={styles.card}
                  aria-label={`Shop ${brand.name}`}
                >
                  <div className={styles.logoWrap}>
                    <Image
                      src={brand.logo as string}
                      alt={brand.name}
                      fill
                      sizes="120px"
                      className={styles.logo}
                    />
                  </div>
                  <span className={styles.name}>{brand.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
