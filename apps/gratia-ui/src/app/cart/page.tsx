// src/app/cart/page.tsx
"use client";

import { useCartStore } from "@/store/cartStore";
import { Button, Container, Divider, Flex } from "@gratia/ui/components";
import { IconClose } from "@gratia/ui/icons";
import Image from "next/image";
import Link from "next/link";
import styles from "./cart.module.scss";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    clearCart,
  } = useCartStore();

  if (items.length === 0) {
    return (
      <Container>
        <div className={styles.emptyCart}>
          <h1>Sepetiniz Boş</h1>
          <p>Alışverişe başlamak için ürünleri inceleyin.</p>
          <Link href="/products/category/all">
            <Button variant="primary">Ürünlere Git</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className={styles.cartContainer}>
        <Flex justify="end" align="center" className={styles.cartHeader}>
          <h1>Sepetim ({getTotalItems()} Ürün)</h1>
          <Button variant="ghost" onClick={clearCart}>
            Sepeti Temizle
          </Button>
        </Flex>

        <div className={styles.cartContent}>
          <div className={styles.cartItems}>
            {items.map((item) => (
              <div key={item.sku} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  <Image
                    src={item.productImages[0]}
                    alt={item.productName}
                    width={120}
                    height={120}
                  />
                </div>

                <div className={styles.itemDetails}>
                  <h3>{item.productName}</h3>

                  <div className={styles.itemAttributes}>
                    {item.attributes.color && (
                      <span className={styles.attribute}>
                        Renk: <strong>{item.attributes.color}</strong>
                      </span>
                    )}
                    {item.attributes.size && (
                      <span className={styles.attribute}>
                        Beden: <strong>{item.attributes.size}</strong>
                      </span>
                    )}
                  </div>

                  <div className={styles.itemPrice}>
                    {item.discountedPrice ? (
                      <Flex gap={8} align="center">
                        <span className={styles.originalPrice}>
                          ₺{item.price.toFixed(2)}
                        </span>
                        <span className={styles.discountedPrice}>
                          ₺{item.discountedPrice.toFixed(2)}
                        </span>
                      </Flex>
                    ) : (
                      <span className={styles.price}>
                        ₺{item.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.itemActions}>
                  <div className={styles.quantityControls}>
                    <button
                      onClick={() =>
                        updateQuantity(item.sku, item.quantity - 1)
                      }
                      className={styles.quantityBtn}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.sku, item.quantity + 1)
                      }
                      className={styles.quantityBtn}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.sku)}
                    aria-label="Ürünü Sil"
                  >
                    <IconClose size={20} />
                  </button>
                </div>

                <div className={styles.itemTotal}>
                  ₺
                  {(
                    (item.discountedPrice || item.price) * item.quantity
                  ).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.cartSummary}>
            <h2>Sipariş Özeti</h2>
            <Divider />

            <div className={styles.summaryRow}>
              <span>Ara Toplam ({getTotalItems()} ürün):</span>
              <span>₺{getTotalPrice().toFixed(2)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Kargo:</span>
              <span className={styles.free}>Ücretsiz</span>
            </div>

            <Divider />

            <div className={styles.summaryTotal}>
              <span>Toplam:</span>
              <span>₺{getTotalPrice().toFixed(2)}</span>
            </div>

            <Button variant="primary">Siparişi Tamamla</Button>

            <Link href="/products/category/all">
              <Button variant="outlined" size="lg">
                Alışverişe Devam Et
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
