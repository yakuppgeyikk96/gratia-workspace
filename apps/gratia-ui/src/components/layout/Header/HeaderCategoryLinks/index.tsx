import { getNavigationItems } from "@/actions";
import HeaderCategoryLinksClient from "./HeaderCategoryLinksClient";

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

  const allLinks = [...collectionLinks, ...categoryLinks];

  return <HeaderCategoryLinksClient links={allLinks} className={className} />;
}
