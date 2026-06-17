# Testing Notes

Quick reference for testing Gratia end-to-end against the live (Stripe test mode)
deployment.

## Stripe Test Cards

All cards use any future expiry (e.g. `12/30`), CVC `123`, ZIP `12345`.

| Card Number             | Scenario                                                      |
| ----------------------- | ------------------------------------------------------------- |
| `4242 4242 4242 4242`   | Plain success, **no 3DS** — quickest happy-path test          |
| `4000 0027 6000 3184`   | 3DS required → click **COMPLETE** → success                   |
| `4000 0082 6000 3178`   | 3DS required → click **FAIL** → declined                      |
| `4000 0000 0000 9995`   | Card declined immediately (no 3DS, no charge)                 |
| `4000 0000 0000 0002`   | Generic decline                                               |
| `4000 0000 0000 0119`   | Processing error                                              |

Full Stripe list: https://docs.stripe.com/testing#cards

## Stripe Test Mode Dashboards

- Payments: https://dashboard.stripe.com/test/payments
- Webhooks: https://dashboard.stripe.com/test/webhooks

## Useful SQL Probes

```sql
-- Last few orders
SELECT order_number, payment_status, items::text, created_at
FROM orders ORDER BY created_at DESC LIMIT 5;

-- Webhook audit (added in commit 42a7d5a)
SELECT event_id, type, status, attempt_count, received_at, processed_at, error_message
FROM webhook_events ORDER BY received_at DESC LIMIT 10;

-- Current stock for AirPods Max
SELECT sku, name, stock FROM products WHERE sku = 'APP-00055';
```

## Stock Locking Test (concurrency)

Goal: prove that two concurrent checkouts cannot oversell.

```sql
-- Force-set stock to 1 for the test
UPDATE products SET stock = 1 WHERE sku = 'APP-00055';
```

1. Open the storefront in two isolated sessions (normal + incognito).
2. Add the same SKU to the cart in both.
3. Click **Proceed to Checkout** in both.
4. The first should land on the shipping form (lock acquired in Redis).
5. The second should fail with **409 Insufficient stock for: APP-00055**.

Restore:

```sql
UPDATE products SET stock = 86 WHERE sku = 'APP-00055';
```

## Refund Test

1. Place a successful order with `4242 4242 4242 4242`.
2. Wait until webhook marks it PAID and stock decrements by 1.
3. In Stripe Dashboard, open the payment → **Refund** → full amount.
4. Within ~10s the `charge.refunded` webhook should fire.
5. Verify in DB:
   - `orders.payment_status` → `refunded`
   - `products.stock` → original + 1
   - `webhook_events` should have a `charge.refunded` row with `status = processed`

## Webhook Configuration Reminder

Production webhook endpoint URL must point at the active API host:

```
https://gratia-api.onrender.com/api/webhooks/stripe
```

`STRIPE_WEBHOOK_SECRET` on Render must match the signing secret shown in the
Stripe webhook endpoint settings. Mismatch → signature verification fails → all
deliveries log as 4xx and orders stay PENDING forever.
