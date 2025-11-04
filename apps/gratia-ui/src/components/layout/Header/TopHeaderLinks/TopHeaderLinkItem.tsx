import Link from "next/link";
import styles from "./TopHeaderLinks.module.scss";

interface TopHeaderLinkItemProps {
  title: string;
  href: string;
}

export default function TopHeaderLinkItem({
  title,
  href,
}: TopHeaderLinkItemProps) {
  return (
    <li className={styles.topHeaderLinkItem}>
      <Link href={href} prefetch={false} target="_blank">
        <span className={styles.topHeaderLinkItemTitle}>{title}</span>
      </Link>
    </li>
  );
}
