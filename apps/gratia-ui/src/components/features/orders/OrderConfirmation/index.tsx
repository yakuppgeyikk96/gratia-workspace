"use client";

import { getOrderByNumber, requestOrderAccess, verifyOrderAccess } from "@/actions";
import { formatPrice } from "@/lib/utils/format";
import type { Order } from "@/types/Order.types";
import Button from "@gratia/ui/components/Button";
import { useEffect, useMemo, useState } from "react";
import styles from "./OrderConfirmation.module.scss";

type Props = {
  orderNumber: string;
  initialOrder: Order | null;
};

const TERMINAL_STATUSES = new Set(["paid", "failed", "refunded"]);

function getStatusClass(status: string) {
  if (status === "paid") return `${styles.status} ${styles.statusPaid}`;
  if (status === "failed") return `${styles.status} ${styles.statusFailed}`;
  return `${styles.status} ${styles.statusPending}`;
}

export default function OrderConfirmation({ orderNumber, initialOrder }: Props) {
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [loading, setLoading] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);

  // Guest access flow
  const [email, setEmail] = useState("");
  const [requestToken, setRequestToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [accessMessage, setAccessMessage] = useState<string | null>(null);

  const paymentStatus = order?.paymentStatus || "pending";
  const canPoll = useMemo(
    () => !!order && !TERMINAL_STATUSES.has(paymentStatus),
    [order, paymentStatus]
  );

  const fetchLatest = async () => {
    setPollError(null);
    try {
      const resp = await getOrderByNumber(orderNumber);
      if (resp.success && resp.data) {
        setOrder(resp.data as Order);
      } else if (resp.success && resp.data === null) {
        // Access may have expired
        setOrder(null);
      } else if (!resp.success) {
        setPollError(resp.message || "Failed to refresh order");
      }
    } catch (e) {
      setPollError(e instanceof Error ? e.message : "Failed to refresh order");
    }
  };

  useEffect(() => {
    if (!canPoll) return;

    const t = setInterval(() => {
      fetchLatest();
    }, 5000);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPoll, orderNumber]);

  const handleRequestAccess = async () => {
    setLoading(true);
    setAccessMessage(null);
    setPollError(null);
    try {
      const resp = await requestOrderAccess(orderNumber, { email });
      if (resp.success && resp.data?.requestToken) {
        setRequestToken(resp.data.requestToken);
        setAccessMessage(
          "If the email matches this order, an access code has been sent."
        );
      } else {
        setPollError(resp.message || "Failed to request access");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccess = async () => {
    if (!requestToken) return;
    setLoading(true);
    setAccessMessage(null);
    setPollError(null);
    try {
      const resp = await verifyOrderAccess(orderNumber, { requestToken, code });
      if (resp.success && resp.data?.orderAccessToken) {
        setAccessMessage("Access verified. Loading your order...");
        await fetchLatest();
      } else {
        setPollError(resp.message || "Invalid code");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Order {orderNumber}</h1>
            <span className={styles.status}>Access required</span>
          </div>

          <h2 className={styles.sectionTitle}>Get access to your order</h2>

          <div className={styles.formRow}>
            <input
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email used in checkout"
              type="email"
            />
            <Button
              variant="primary"
              onClick={handleRequestAccess}
              loading={loading}
              disabled={!email}
            >
              Send access code
            </Button>
          </div>

          {requestToken && (
            <>
              <div className={styles.hint}>
                Enter the 6-digit code you received.
              </div>
              <div className={styles.formRow}>
                <input
                  className={styles.input}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6-digit code"
                  inputMode="numeric"
                />
                <Button
                  variant="primary"
                  onClick={handleVerifyAccess}
                  loading={loading}
                  disabled={code.length !== 6}
                >
                  Verify
                </Button>
              </div>
            </>
          )}

          {accessMessage && <div className={styles.hint}>{accessMessage}</div>}
          {pollError && <div className={styles.error}>{pollError}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Order {order.orderNumber}</h1>
          <span className={getStatusClass(order.paymentStatus)}>
            {order.paymentStatus.toUpperCase()}
          </span>
        </div>

        <h2 className={styles.sectionTitle}>Items</h2>
        <div className={styles.items}>
          {order.items.map((item) => {
            const unitPrice =
              item.discountedPrice !== undefined &&
                item.discountedPrice > 0 &&
                item.discountedPrice < item.price
                ? item.discountedPrice
                : item.price;
            const total = unitPrice * item.quantity;
            return (
              <div key={item.sku} className={styles.itemRow}>
                <div>
                  <div className={styles.itemName}>{item.productName}</div>
                  <div className={styles.muted}>
                    {item.sku} • ×{item.quantity}
                  </div>
                </div>
                <div className={styles.price}>{formatPrice(total)}</div>
              </div>
            );
          })}
        </div>

        <div className={styles.pricing}>
          <div className={styles.pricingRow}>
            <span className={styles.label}>Subtotal</span>
            <span className={styles.value}>{formatPrice(order.pricing.subtotal)}</span>
          </div>
          {order.pricing.discount > 0 && (
            <div className={styles.pricingRow}>
              <span className={styles.label}>Discount</span>
              <span className={styles.value}>-{formatPrice(order.pricing.discount)}</span>
            </div>
          )}
          <div className={styles.pricingRow}>
            <span className={styles.label}>Shipping</span>
            <span className={styles.value}>{formatPrice(order.pricing.shippingCost)}</span>
          </div>
          {order.pricing.tax !== undefined && order.pricing.tax > 0 && (
            <div className={styles.pricingRow}>
              <span className={styles.label}>Tax</span>
              <span className={styles.value}>{formatPrice(order.pricing.tax)}</span>
            </div>
          )}
          <div className={styles.pricingRow}>
            <span className={styles.label}>Total</span>
            <span className={styles.value}>{formatPrice(order.pricing.total)}</span>
          </div>
        </div>

        {pollError && <div className={styles.error}>{pollError}</div>}
        {!TERMINAL_STATUSES.has(order.paymentStatus) && (
          <div className={styles.hint}>
            Payment is still processing. This page will update automatically.
          </div>
        )}
      </div>
    </div>
  );
}

