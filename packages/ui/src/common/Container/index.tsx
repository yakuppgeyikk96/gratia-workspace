import React from "react";
import styles from "./Container.module.scss";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "narrow" | "wide" | "fluid";
}

export default function Container({
  children,
  className = "",
  variant = "default",
}: ContainerProps) {
  const containerClass = [styles.container, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return <div className={containerClass}>{children}</div>;
}
