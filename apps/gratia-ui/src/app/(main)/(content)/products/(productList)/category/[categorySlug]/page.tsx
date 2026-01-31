import { getFilterOptions, getProducts } from "@/actions/product";
import FilterOptionsSync from "@/components/features/product/FilterOptionsSync";
import ProductList from "@/components/features/product/ProductList";
import {
  parseFiltersFromSearchParams,
  parsePageFromSearchParams,
  parseSortFromSearchParams,
} from "@/lib/filterUtils";
import { SortOptions } from "@/types/Product.types";

interface CategoryProductsPageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CategoryProductsPage({
  params,
  searchParams,
}: CategoryProductsPageProps) {
  const { categorySlug } = await params;
  const resolvedSearchParams = await searchParams;

  // Parse query parameters
  const page = parsePageFromSearchParams(resolvedSearchParams);
  const sort = parseSortFromSearchParams(resolvedSearchParams) as SortOptions | undefined;
  const filters = parseFiltersFromSearchParams(resolvedSearchParams);

  // Fetch products and filters in parallel
  // Pass filters to getFilterOptions for faceted search counts
  const [productsRes, filtersRes] = await Promise.all([
    getProducts(
      {
        categorySlug,
        page,
        limit: 12,
        sort,
      },
      filters
    ),
    getFilterOptions(categorySlug, undefined, filters),
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
