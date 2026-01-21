"use client";

import { CartWarning, CartWarningType } from "@/types/Cart.types";
import { useMemo, useState } from "react";
import styles from "./CartWarningBanner.module.scss";

// ============================================================================
// Types
// ============================================================================

interface CartWarningBannerProps {
  warnings: CartWarning[];
  onDismiss?: () => void;
}

interface GroupedWarnings {
  priceIncreased: CartWarning[];
  priceDecreased: CartWarning[];
  lowStock: CartWarning[];
  outOfStock: CartWarning[];
  inactive: CartWarning[];
}

// ============================================================================
// Warning Icons
// ============================================================================

const WarningIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 6V10M10 14H10.01M3.07 16.5H16.93C18.28 16.5 19.11 15.04 18.44 13.88L11.51 2.38C10.84 1.22 9.16 1.22 8.49 2.38L1.56 13.88C0.89 15.04 1.72 16.5 3.07 16.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 14V10M10 6H10.01"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4L4 12M4 4L12 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ============================================================================
// Helper Functions
// ============================================================================

function groupWarnings(warnings: CartWarning[]): GroupedWarnings {
  return warnings.reduce<GroupedWarnings>(
    (acc, warning) => {
      switch (warning.type) {
        case "price_increased":
          acc.priceIncreased.push(warning);
          break;
        case "price_decreased":
          acc.priceDecreased.push(warning);
          break;
        case "low_stock":
          acc.lowStock.push(warning);
          break;
        case "out_of_stock":
          acc.outOfStock.push(warning);
          break;
        case "inactive":
          acc.inactive.push(warning);
          break;
      }
      return acc;
    },
    {
      priceIncreased: [],
      priceDecreased: [],
      lowStock: [],
      outOfStock: [],
      inactive: [],
    },
  );
}

function getWarningVariant(
  type: CartWarningType,
): "error" | "warning" | "info" {
  switch (type) {
    case "out_of_stock":
    case "inactive":
      return "error";
    case "price_increased":
    case "low_stock":
      return "warning";
    case "price_decreased":
      return "info";
    default:
      return "warning";
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

interface WarningGroupProps {
  title: string;
  warnings: CartWarning[];
  variant: "error" | "warning" | "info";
  showDetails?: boolean;
}

function WarningGroup({
  title,
  warnings,
  variant,
  showDetails = false,
}: WarningGroupProps) {
  const [expanded, setExpanded] = useState(showDetails);

  if (warnings.length === 0) return null;

  return (
    <div className={`${styles.warningGroup} ${styles[variant]}`}>
      <div
        className={styles.groupHeader}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={styles.groupIcon}>
          {variant === "info" ? <InfoIcon /> : <WarningIcon />}
        </div>
        <span className={styles.groupTitle}>{title}</span>
        <span className={styles.groupCount}>{warnings.length}</span>
        <button className={styles.expandButton} aria-label="Expand">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={expanded ? styles.expanded : ""}
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {expanded && (
        <ul className={styles.warningList}>
          {warnings.map((warning, index) => (
            <li key={`${warning.sku}-${index}`} className={styles.warningItem}>
              <span className={styles.productName}>{warning.productName}</span>
              <span className={styles.warningMessage}>{warning.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function CartWarningBanner({
  warnings,
  onDismiss,
}: CartWarningBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const groupedWarnings = useMemo(() => groupWarnings(warnings), [warnings]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed || warnings.length === 0) {
    return null;
  }

  const hasErrors =
    groupedWarnings.outOfStock.length > 0 ||
    groupedWarnings.inactive.length > 0;

  return (
    <div className={styles.banner}>
      <div className={styles.bannerHeader}>
        <div className={styles.bannerTitle}>
          <WarningIcon />
          <span>
            There {warnings.length === 1 ? "is" : "are"} {warnings.length}{" "}
            {warnings.length === 1 ? "issue" : "issues"} with your cart
          </span>
        </div>
        {onDismiss && (
          <button
            className={styles.dismissButton}
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      <div className={styles.warningGroups}>
        {/* Critical errors first */}
        <WarningGroup
          title="Out of Stock"
          warnings={groupedWarnings.outOfStock}
          variant="error"
          showDetails={true}
        />
        <WarningGroup
          title="Inactive"
          warnings={groupedWarnings.inactive}
          variant="error"
          showDetails={true}
        />

        {/* Stock warnings */}
        <WarningGroup
          title="Low Stock"
          warnings={groupedWarnings.lowStock}
          variant="warning"
        />

        {/* Price changes */}
        <WarningGroup
          title="Price Increased"
          warnings={groupedWarnings.priceIncreased}
          variant="warning"
        />
        <WarningGroup
          title="Price Decreased"
          warnings={groupedWarnings.priceDecreased}
          variant="info"
        />
      </div>

      {hasErrors && (
        <p className={styles.errorNote}>
          Items marked as &quot;Out of Stock&quot; or &quot;Inactive&quot;
          cannot be purchased.
        </p>
      )}
    </div>
  );
}
