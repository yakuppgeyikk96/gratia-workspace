// packages/ui/src/components/Checkbox/index.tsx
import classNames from "classnames";
import React, {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useId,
} from "react";
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
      className,
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
      onChange?.(e);
      onValueChange?.(e.target.checked);
    };

    const checkboxClass = classNames(
      styles.checkbox,
      styles[`checkbox-${size}`],
      {
        [styles.checkboxError as string]: error,
        [styles.disabled as string]: disabled,
      }
    );

    const labelClass = classNames(styles.label, styles[`label-${size}`], {
      [styles.disabled as string]: disabled,
    });

    const containerClass = classNames(styles.checkboxContainer, className);

    const iconSize = size === "sm" ? 12 : size === "md" ? 16 : 20;

    const inputProps: InputHTMLAttributes<HTMLInputElement> = {
      type: "checkbox" as const,
      id: checkboxId,
      name,
      value,
      onChange: handleChange,
      disabled,
      className: checkboxClass,
      ...props,
    };

    /**
     * Controlled/Uncontrolled management
     */
    if (checked !== undefined) {
      inputProps.checked = checked;
    } else {
      inputProps.defaultChecked = defaultChecked;
    }

    return (
      <div className={containerClass}>
        <div className={styles.checkboxWrapper}>
          <input ref={ref} {...inputProps} />
          <label htmlFor={checkboxId} className={labelClass}>
            <span className={styles.checkboxVisual}>
              <IconTick size={iconSize} color="currentColor" />
            </span>
            {label && <span className={styles.labelText}>{label}</span>}
          </label>
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
