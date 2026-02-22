"use client";

import Link from "next/link";
import Button from "@gratia/ui/components/Button";
import styles from "./products.module.scss";

export default function ProductsPage() {
  return (
    <div>
      <div className={styles.header}>
        <h1>Products</h1>
        <Link href="/products/create">
          <Button>Create Product</Button>
        </Link>
      </div>
      <p>Product list will be displayed here.</p>
    </div>
  );
}
