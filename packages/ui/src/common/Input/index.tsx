import React, { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import styles from "./Input.module.scss";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  variant?: "filled" | "outlined";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  error?: boolean;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      variant = "filled",
      startIcon,
      endIcon,
      error = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const inputClass = [
      styles.input,
      styles[`input-${size}`],
      styles[`input-${variant}`],
      startIcon && styles[`input-with-start-icon`],
      endIcon && styles[`input-with-end-icon`],
      error && styles.inputError,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    console.log(error);

    return (
      <div className={styles.inputContainer}>
        {startIcon && (
          <div className={`${styles.startIcon} ${styles[`startIcon-${size}`]}`}>
            {startIcon}
          </div>
        )}
        <input ref={ref} className={inputClass} {...props} />
        {endIcon && (
          <div className={`${styles.endIcon} ${styles[`endIcon-${size}`]}`}>
            {endIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
