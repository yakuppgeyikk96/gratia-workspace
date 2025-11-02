import { Container } from "@gratia/ui/components";
import styles from "./content.module.scss";

export default function ContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Container className={styles.contentLayout}>{children}</Container>;
}
