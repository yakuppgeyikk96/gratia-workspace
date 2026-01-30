import { getFilterOptions, getProductsByCategory } from "@/actions/product";
import FilterOptionsSync from "@/components/features/product/FilterOptionsSync";
import ProductList from "@/components/features/product/ProductList";

interface CategoryProductsPageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryProductsPage({
  params,
  searchParams,
}: CategoryProductsPageProps) {
  const { categorySlug } = await params;
  const { page } = await searchParams;

  const pageNumber = page ? parseInt(page, 10) : 1;
  const validPage = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;

  const [productsRes, filtersRes] = await Promise.all([
    getProductsByCategory(categorySlug, {
      page: validPage,
      limit: 12,
    }),
    getFilterOptions(categorySlug),
  ]);

  const data = productsRes?.data;
  const categoryFilters = filtersRes?.data;

  return (
    <>
      <FilterOptionsSync options={categoryFilters} parentCategorySlug={categorySlug} />
      <ProductList
        products={data?.products ?? []}
        title=""
        pagination={data?.pagination}
      />
    </>
  );
}
