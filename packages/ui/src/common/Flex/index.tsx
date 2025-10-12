import { JSX, ReactNode } from "react";
import styles from "./Flex.module.scss";

interface FlexProps {
  children: ReactNode;
  className?: string;
  direction?: "row" | "column";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  gap?: number;
  as?: keyof JSX.IntrinsicElements;
}

export default function Flex({
  children,
  className = "",
  direction = "row",
  align = "stretch",
  justify = "start",
  gap = 0,
  as: Component = "div",
}: FlexProps) {
  const flexClass = [
    styles.flex,
    styles[`direction-${direction}`],
    styles[`align-${align}`],
    styles[`justify-${justify}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style = gap > 0 ? { gap: `${gap}px` } : {};

  return (
    <Component className={flexClass} style={style}>
      {children}
    </Component>
  );
}
