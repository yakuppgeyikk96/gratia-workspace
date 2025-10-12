import styles from "./Divider.module.scss";

interface DividerProps {
  className?: string;
}

export default function Divider({ className }: DividerProps) {
  const dividerClass = [styles.divider, className].join(" ");

  return <div className={dividerClass} />;
}
