"use client";

import ProductCard from "@/components/features/product/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { wishlistEntryToCardProduct } from "@/lib/utils/wishlist";
import Button from "@gratia/ui/components/Button";
import LoadingSpinner from "@gratia/ui/components/LoadingSpinner";
import { Heart } from "lucide-react";
import Link from "next/link";
import styles from "./WishlistPageContainer.module.scss";

interface WishlistPageContainerProps {
  isLoggedIn: boolean;
}

export default function WishlistPageContainer({
  isLoggedIn,
}: WishlistPageContainerProps) {
  const { wishlist, isLoading } = useWishlist(isLoggedIn);

  if (!isLoggedIn) {
    return (
      <div className={styles.emptyState}>
        <Heart size={64} strokeWidth={1.2} className={styles.emptyIcon} />
        <h1 className={styles.emptyTitle}>Sign in to view your wishlist</h1>
        <p className={styles.emptyText}>
          Save items you love and find them again from any device.
        </p>
        <Link href="/login" prefetch={false}>
          <Button variant="primary" size="lg">
            Log in
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  if (wishlist.items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Heart size={64} strokeWidth={1.2} className={styles.emptyIcon} />
        <h1 className={styles.emptyTitle}>Your wishlist is empty</h1>
        <p className={styles.emptyText}>
          Tap the heart on any product to save it for later.
        </p>
        <Link href="/" prefetch={false}>
          <Button variant="primary" size="lg">
            Start shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.wishlistContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Wishlist</h1>
        <span className={styles.count}>{wishlist.count} items</span>
      </header>

      <div className={styles.grid}>
        {wishlist.items.map((entry) => (
          <ProductCard
            key={entry.wishlistItemId}
            product={wishlistEntryToCardProduct(entry)}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
    </div>
  );
}
