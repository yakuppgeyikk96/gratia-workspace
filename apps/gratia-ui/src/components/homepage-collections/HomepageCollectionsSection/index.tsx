import { getActiveCollections } from "@/actions/collection";
import Container from "@gratia/ui/components/Container";

import CollectionCard from "../CollectionCard";
import styles from "./HomepageCollectionsSection.module.scss";

export default async function HomepageCollectionsSection() {
  const response = await getActiveCollections();

  if (!response.success || !response.data || response.data.length === 0) {
    return null;
  }

  const collections = [...response.data].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
  );

  return (
    <section className={styles.section}>
      <Container className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>Shop the collections</h2>
          <p className={styles.subtitle}>
            Curated picks across categories — new arrivals, best sellers, and
            seasonal edits.
          </p>
        </header>

        <div className={styles.scroller}>
          <ul className={styles.list}>
            {collections.map((collection) => (
              <li key={collection.id} className={styles.item}>
                <CollectionCard collection={collection} />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
