import React, { forwardRef, ReactNode, useId } from "react";
import IconTick from "../../icons/IconTick";
import styles from "./Checkbox.module.scss";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string | ReactNode;
  error?: boolean;
  className?: string;
  id?: string;
  name?: string;
  value?: string;
  onValueChange?: (value: boolean) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked = false,
      disabled = false,
      size = "md",
      label,
      error = false,
      className = "",
      id,
      name,
      value,
      onValueChange,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      onChange?.(e);
      onValueChange?.(newChecked);
    };

    const isControlled = checked !== undefined;
    const defaultInputProps = isControlled ? { checked } : { defaultChecked };

    return (
      <div className={`${styles.checkboxContainer} ${className}`}>
        <div className={styles.checkboxWrapper}>
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            name={name}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={`${styles.checkbox} ${styles[`checkbox-${size}`]} ${
              error ? styles.checkboxError : ""
            } ${disabled ? styles.disabled : ""}`}
            {...defaultInputProps}
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={`${styles.label} ${styles[`label-${size}`]} ${
              disabled ? styles.disabled : ""
            }`}
          >
            <span className={styles.checkboxVisual}>
              <IconTick
                size={size === "sm" ? 12 : size === "md" ? 16 : 20}
                color="currentColor"
              />
            </span>
            {label && (
              <span className={styles.labelText}>
                {typeof label === "string" ? label : label}
              </span>
            )}
          </label>
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
