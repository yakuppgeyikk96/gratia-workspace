import classNames from "classnames";
import { forwardRef, TextareaHTMLAttributes } from "react";
import styles from "./Textarea.module.scss";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  size?: "sm" | "md" | "lg";
  variant?: "filled" | "outlined";
  error?: boolean;
  className?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = "md",
      variant = "filled",
      error = false,
      className = "",
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaClass = classNames(
      styles.textarea,
      styles[`textarea-${size}`],
      styles[`textarea-${variant}`],
      {
        [styles.textareaError as string]: error,
      },
      className
    );

    return (
      <textarea ref={ref} className={textareaClass} rows={rows} {...props} />
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
