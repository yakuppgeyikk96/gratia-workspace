"use client";

import styles from "./ProductFiltersSkeleton.module.scss";

export default function ProductFiltersSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden aria-busy>
      {/* Price */}
      <div className={styles.section}>
        <div className={styles.sectionHeading} />
        <div className={styles.priceInputs}>
          <div className={styles.priceInput} />
          <div className={styles.priceInput} />
        </div>
      </div>

      {/* Kategori (collapsible) */}
      <div className={styles.section}>
        <div className={styles.collapsibleTrigger} />
        <div className={styles.collapsibleItems}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.collapsibleItem} />
          ))}
        </div>
      </div>

      {/* Brand (collapsible) */}
      <div className={styles.section}>
        <div className={styles.collapsibleTrigger} />
        <div className={styles.collapsibleItems}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.collapsibleItem} />
          ))}
        </div>
      </div>

      {/* Attribute sections */}
      <div className={styles.section}>
        <div className={styles.collapsibleTrigger} />
        <div className={styles.collapsibleItems}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.attributeItem} />
          ))}
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.collapsibleTrigger} />
        <div className={styles.collapsibleItems}>
          {[1, 2].map((i) => (
            <div key={i} className={styles.attributeItem} />
          ))}
        </div>
      </div>
    </div>
  );
}
