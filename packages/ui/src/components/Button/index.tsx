import classNames from "classnames";
import { ButtonHTMLAttributes, ReactNode } from "react";
import LoadingSpinner from "../LoadingSpinner";
import styles from "./Button.module.scss";

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outlined" | "ghost";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export default function Button({
  children,
  size = "md",
  variant = "primary",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  className = "",
  ariaLabel,
  ...props
}: ButtonProps) {
  const buttonClass = classNames(
    styles.button,
    styles[`button-${size}`],
    styles[`button-${variant}`],
    disabled && styles.disabled,
    loading && styles.loading,
    className
  );

  const iconClass = classNames(
    styles.icon,
    styles[`icon-${iconPosition}`],
    styles[`icon-${size}`],
    className
  );

  return (
    <button
      className={buttonClass}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      {...props}
    >
      {icon && iconPosition === "left" && !loading && (
        <span className={iconClass}>{icon}</span>
      )}

      {loading && (
        <span className={styles.loadingSpinner}>
          <LoadingSpinner size={size} />
        </span>
      )}

      <span className={styles.text}>{children}</span>

      {icon && iconPosition === "right" && !loading && (
        <span className={iconClass}>{icon}</span>
      )}
    </button>
  );
}
