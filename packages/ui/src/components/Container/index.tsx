import classNames from "classnames";
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
  const containerClass = classNames(
    styles.container,
    styles[variant],
    className
  );

  return <div className={containerClass}>{children}</div>;
}
