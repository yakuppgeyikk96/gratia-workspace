import { ReactNode, forwardRef } from "react";
import styles from "./FormField.module.scss";

interface FormFieldProps {
  children: ReactNode;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  htmlFor?: string;
  name?: string;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      children,
      label,
      error,
      hint,
      required = false,
      className = "",
      htmlFor,
      name,
    },
    ref
  ) => {
    const fieldClass = [styles.field, error && styles.fieldError, className]
      .filter(Boolean)
      .join(" ");

    const fieldId = htmlFor || name;

    return (
      <div ref={ref} className={fieldClass}>
        {label && (
          <label htmlFor={fieldId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={styles.inputWrapper}>{children}</div>

        {error && (
          <div className={styles.error} role="alert" id={`${fieldId}-error`}>
            {error}
          </div>
        )}

        {hint && !error && (
          <div className={styles.hint} id={`${fieldId}-hint`}>
            {hint}
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;
