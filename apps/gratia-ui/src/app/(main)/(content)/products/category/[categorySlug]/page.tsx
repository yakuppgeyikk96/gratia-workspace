import { getNavigationItems } from "@/actions/navigation";
import { getProductsByCategory } from "@/actions/product";
import ProductList from "@/components/features/product/ProductList";
import { cache } from "react";

interface CategoryProductsPageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const getCachedNavigationItems = cache(async () => {
  return await getNavigationItems();
});

export async function generateStaticParams() {
  const { data: navigationItems } = await getCachedNavigationItems();

  if (!navigationItems?.categories) {
    return [];
  }

  return navigationItems.categories.map((category) => ({
    categorySlug: category.slug,
  }));
}

export default async function CategoryProductsPage({
  params,
  searchParams,
}: CategoryProductsPageProps) {
  const { categorySlug } = await params;
  const { page } = await searchParams;

  const pageNumber = page ? parseInt(page, 10) : 1;
  const validPage = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;

  const { data } = await getProductsByCategory(categorySlug, {
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
