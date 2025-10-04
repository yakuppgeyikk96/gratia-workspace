import { HEADER_CATEGORY_LINKS } from "@/constants";
import HeaderCategoryLinkItem from "./HeaderCategoryLinkItem";
import styles from "./HeaderCategoryLinks.module.scss";

interface HeaderCategoryLinksProps {
  className?: string;
}

export default function HeaderCategoryLinks({
  className = "",
}: HeaderCategoryLinksProps) {
  return (
    <nav className={`${styles.container} ${className}`}>
      {HEADER_CATEGORY_LINKS.map((link) => (
        <HeaderCategoryLinkItem key={link.href} href={link.href}>
          {link.title}
        </HeaderCategoryLinkItem>
      ))}
    </nav>
  );
}
