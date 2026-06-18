import type { Collection, CollectionType } from "@/types/Collection.types";
import Image from "next/image";
import Link from "next/link";

import styles from "./CollectionCard.module.scss";

interface CollectionCardProps {
  collection: Collection;
}

const TYPE_LABEL: Record<CollectionType, string> = {
  new: "New",
  trending: "Trending",
  sale: "Sale",
  featured: "Featured",
};

const FALLBACK_IMAGE = "https://picsum.photos/seed/collection-default/800/600";

export default function CollectionCard({ collection }: CollectionCardProps) {
  const href = `/products/collection/${collection.slug}`;
  const imageSrc = collection.imageUrl ?? FALLBACK_IMAGE;
  const badge = TYPE_LABEL[collection.collectionType];

  return (
    <Link href={href} prefetch={false} className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={imageSrc}
          alt={collection.name}
          fill
          sizes="(max-width: 640px) 80vw, 360px"
          className={styles.image}
        />
        <div className={styles.overlay} />
        <span className={styles.badge}>{badge}</span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{collection.name}</h3>
        {collection.description ? (
          <p className={styles.description}>{collection.description}</p>
        ) : null}
        <span className={styles.cta}>
          Shop now
          <span aria-hidden="true" className={styles.arrow}>
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
