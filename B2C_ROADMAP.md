# B2C Feature Roadmap

Storefront tarafında eklenmesi planlanan özellikler. Mülakat etkisine göre gruplandı.

Status: `[ ]` planned · `[~]` in progress · `[x]` done

---

## A. Hızlı kazanç paketi (storefront, görünür)

- [ ] **Wishlist / favorites** — auth ile bağlı, ürün kart ikon, wishlist sayfası, "wishlist'ten sepete taşı"
- [ ] **Recently viewed** — Redis list (son N ürün), home/category sayfasında strip
- [ ] **Reviews & ratings** — yıldız + yorum + (opsiyonel) fotoğraf; aggregation (avg, count by star); "verified purchase" rozeti; sort/filter
- [ ] **Search filters/facets** — fiyat aralığı, brand, color, size, rating; sort (price asc/desc, newest, top rated); pagination

## B. Engineering depth paketi (backend hikayesi)

- [ ] **Order tracking page + canlı state machine** — `orders.status` kolonu şu an ölü; timeline (placed → paid → shipped → delivered); state transition logic + audit trail
- [ ] **Coupon / promo code engine** — yüzde/sabit indirim, min sepet tutarı, expiration, kullanım limiti, kategori/brand kısıtı, stacking kuralları
- [ ] **Returns / refunds flow** — müşteri talebi (requested → approved → received → refunded), Stripe refund API
- [ ] **Back-in-stock notifications** — "Notify me" butonu, stock 0→positive olunca email, event-driven + queue
- [ ] **Loyalty points / ledger** — immutable transaction tablosu, kazan/harca, balance
- [ ] **Multi-currency + tax** — locale-based fiyat, location-based tax
- [ ] **Abandoned cart recovery** — checkout başlatıp bitirmeyenlere 1-24 saat sonra email

## C. Account / UX polish

- [ ] **Address book** — multiple shipping addresses, default seçimi, checkout'ta seçim
- [ ] **Account settings page** — profile edit, password change, email preferences
- [ ] **Email genişletme** — welcome, shipping notification, return confirmation (şu an sadece "payment received")
- [ ] **Newsletter subscription** — footer email capture, double opt-in

## D. Bonus / diferansiyatör

- [ ] **Recommendations** — "Similar products" (same category/brand), "Frequently bought together" (order_items co-occurrence SQL)
- [ ] **Real-time inventory** — SSE/WebSocket ile product detail'da stock anında güncellenir
- [ ] **PWA + Web Push** — order status değişince push bildirim
- [ ] **Product Q&A** — kullanıcılar ürün hakkında soru sorar/cevaplar
- [ ] **A/B testing infra** — feature flag table + variant assignment + conversion tracking

---

## Production discipline (paralel iz, mülakat için "real team" sinyali)

- [ ] CI: GitHub Actions (lint + types + test + build gates)
- [ ] Sentry + structured logging (pino) + minimum bir OpenTelemetry trace
- [ ] Playwright E2E: login → add to cart → checkout golden path
- [ ] Admin panel (B2C tamamlandıktan sonra)
