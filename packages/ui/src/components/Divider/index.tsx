import classNames from "classnames";
import styles from "./Divider.module.scss";

interface DividerProps {
  className?: string;
}

export default function Divider({ className }: DividerProps) {
  const dividerClass = classNames(styles.divider, className);

  return <div className={dividerClass} />;
}
