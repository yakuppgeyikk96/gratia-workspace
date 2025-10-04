import Link from "next/link";
import { ReactNode } from "react";
import styles from "./HeaderCategoryLinkItem.module.scss";

interface HeaderCategoryLinkItemProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function HeaderCategoryLinkItem({
  children,
  href,
  onClick,
  className = "",
}: HeaderCategoryLinkItemProps) {
  const linkClass = [styles.link, className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link href={href} className={linkClass} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={linkClass} onClick={onClick}>
      {children}
    </button>
  );
}
