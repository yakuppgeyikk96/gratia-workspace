import { getNavigationItems } from "@/actions/navigation";
import { getProductsByCollection } from "@/actions/product";
import ProductList from "@/components/features/product/ProductList";
import { cache } from "react";

interface CollectionProductsPageProps {
  params: Promise<{ collectionSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const getCachedNavigationItems = cache(async () => {
  return await getNavigationItems();
});

export async function generateStaticParams() {
  const { data: navigationItems } = await getCachedNavigationItems();

  if (!navigationItems?.collections) {
    return [];
  }

  return navigationItems.collections.map((collection) => ({
    collectionSlug: collection.slug,
  }));
}

export default async function CollectionProductsPage({
  params,
  searchParams,
}: CollectionProductsPageProps) {
  const { collectionSlug } = await params;
  const { page } = await searchParams;

  const pageNumber = page ? parseInt(page, 10) : 1;
  const validPage = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;

  const { data } = await getProductsByCollection(collectionSlug, {
    page: validPage,
    limit: 12,
  });

  return (
    <ProductList
      products={data?.products ?? []}
      title=""
      pagination={data?.pagination}
    />
  );
}
