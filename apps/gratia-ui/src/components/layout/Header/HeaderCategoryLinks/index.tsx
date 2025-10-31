import { getNavigationItems } from "@/actions";
import HeaderCategoryLinkItem from "./HeaderCategoryLinkItem";
import styles from "./HeaderCategoryLinks.module.scss";

interface HeaderCategoryLinksProps {
  className?: string;
}

export default async function HeaderCategoryLinks({
  className = "",
}: HeaderCategoryLinksProps) {
  const { data: navigationItems } = await getNavigationItems();

  const collectionLinks =
    navigationItems?.collections.map((collection) => ({
      title: collection.name,
      href: `/products/collection/${collection.slug}`,
    })) ?? [];

  const categoryLinks =
    navigationItems?.categories.map((category) => ({
      title: category.name,
      href: `/products/category/${category.slug}`,
    })) ?? [];

  return (
    <nav className={`${styles.container} ${className}`}>
      {[...collectionLinks, ...categoryLinks].map((link) => (
        <HeaderCategoryLinkItem key={link.href} href={link.href}>
          {link.title}
        </HeaderCategoryLinkItem>
      ))}
    </nav>
  );
}
