import React, { ButtonHTMLAttributes, ReactNode } from "react";
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
  const buttonClass = [
    styles.button,
    styles[`button-${size}`],
    styles[`button-${variant}`],
    disabled && styles.disabled,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconClass = [
    styles.icon,
    styles[`icon-${iconPosition}`],
    styles[`icon-${size}`],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={buttonClass}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <span className={iconClass}>{icon}</span>
      )}

      <span className={styles.text}>{children}</span>

      {icon && iconPosition === "right" && (
        <span className={iconClass}>{icon}</span>
      )}

      {loading && (
        <span className={styles.loadingSpinner}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
            >
              <animate
                attributeName="stroke-dasharray"
                dur="2s"
                values="0 31.416;15.708 15.708;0 31.416"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-dashoffset"
                dur="2s"
                values="0;-15.708;-31.416"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </span>
      )}
    </button>
  );
}
