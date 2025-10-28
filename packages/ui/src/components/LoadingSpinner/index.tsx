import classNames from "classnames";
import styles from "./LoadingSpinner.module.scss";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  color = "currentColor",
  className = "",
}: LoadingSpinnerProps) {
  const spinnerClass = classNames(
    styles.spinner,
    styles[`spinner-${size}`],
    className
  );

  return (
    <span className={spinnerClass}>
      <svg
        width={size === "sm" ? "12" : size === "lg" ? "20" : "16"}
        height={size === "sm" ? "12" : size === "lg" ? "20" : "16"}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke={color}
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
  );
}
