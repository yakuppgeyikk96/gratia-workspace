import styles from "./productLayout.module.scss";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.productLayout}>{children}</div>;
}
