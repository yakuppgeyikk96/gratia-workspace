"use client";

import * as OneTimePasswordField from "@radix-ui/react-one-time-password-field";
import classNames from "classnames";
import { forwardRef, useState } from "react";
import styles from "./OneTimePassword.module.scss";

export interface OneTimePasswordProps {
  length?: number;
  size?: "sm" | "md" | "lg";
  variant?: "filled" | "outlined";
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  onComplete?: (value: string) => void;
  onChange?: (value: string) => void;
}

const OneTimePassword = forwardRef<HTMLDivElement, OneTimePasswordProps>(
  (
    {
      length = 6,
      size = "md",
      variant = "filled",
      error = false,
      disabled = false,
      autoFocus = false,
      className = "",
      onComplete,
      onChange,
    },
    ref
  ) => {
    const [value, setValue] = useState("");

    const handleValueChange = (newValue: string) => {
      setValue(newValue);
      onChange?.(newValue);

      if (newValue.length === length) {
        onComplete?.(newValue);
      }
    };

    const containerClass = classNames(
      styles.container,
      styles[`container-${size}`],
      { [styles.containerError as string]: error },
      className
    );

    const inputClass = classNames(
      styles.input,
      styles[`input-${size}`],
      styles[`input-${variant}`],
      { [styles.inputError as string]: error }
    );

    return (
      <div ref={ref} className={containerClass}>
        <OneTimePasswordField.Root
          value={value}
          onValueChange={handleValueChange}
          autoFocus={autoFocus}
          disabled={disabled}
          className={styles.root}
        >
          {Array.from({ length }, (_, index) => (
            <OneTimePasswordField.Input key={index} className={inputClass} />
          ))}
          <OneTimePasswordField.HiddenInput />
        </OneTimePasswordField.Root>
      </div>
    );
  }
);

OneTimePassword.displayName = "OneTimePassword";

export default OneTimePassword;
