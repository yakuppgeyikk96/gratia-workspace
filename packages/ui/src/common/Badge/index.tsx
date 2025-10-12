import styles from "./Badge.module.scss";

interface BadgeProps {
  count: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary";
  showZero?: boolean;
  className?: string;
}

export default function Badge({
  count,
  size = "md",
  color = "secondary",
  showZero = false,
  className = "",
}: BadgeProps) {
  if (count === 0 && !showZero) {
    return null;
  }

  const badgeClass = [
    styles.badge,
    styles[`badge-${size}`],
    styles[`badge-${color}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const displayCount = count > 99 ? "99+" : count.toString();

  return <span className={badgeClass}>{displayCount}</span>;
}
