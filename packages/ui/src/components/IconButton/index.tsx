import classNames from "classnames";
import { ReactNode } from "react";
import Badge from "../Badge";
import styles from "./IconButton.module.scss";

interface IconButtonProps {
  icon: ReactNode;
  badge?: number;
  size?: "sm" | "md" | "lg";
  backgroundColor?: string;
  iconColor?: string;
  badgeColor?: "primary" | "secondary";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function IconButton({
  icon,
  badge,
  size = "md",
  backgroundColor,
  iconColor,
  badgeColor = "secondary",
  onClick,
  className = "",
  disabled = false,
  ariaLabel,
}: IconButtonProps) {
  const buttonClass = classNames(
    styles.iconButton,
    styles[`iconButton-${size}`],
    { [styles.disabled as string]: disabled },
    className
  );

  const buttonStyle = backgroundColor ? { backgroundColor } : {};
  const iconStyle = iconColor ? { color: iconColor } : {};

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
      aria-label={ariaLabel}
    >
      <div className={styles.icon} style={iconStyle}>
        {icon}
      </div>
      {badge !== undefined && badge > 0 && (
        <div className={styles.badgeContainer}>
          <Badge count={badge} size={size} color={badgeColor} />
        </div>
      )}
    </button>
  );
}
