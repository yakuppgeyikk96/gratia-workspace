import { getFilterOptions, getProducts } from "@/actions/product";
import FilterOptionsSync from "@/components/features/product/FilterOptionsSync";
import ProductList from "@/components/features/product/ProductList";
import {
  parseFiltersFromSearchParams,
  parsePageFromSearchParams,
  parseSortFromSearchParams,
} from "@/lib/filterUtils";
import { SortOptions } from "@/types/Product.types";

interface CollectionProductsPageProps {
  params: Promise<{ collectionSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CollectionProductsPage({
  params,
  searchParams,
}: CollectionProductsPageProps) {
  const { collectionSlug } = await params;
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
        collectionSlug,
        page,
        limit: 12,
        sort,
      },
      filters
    ),
    getFilterOptions(undefined, collectionSlug, filters),
  ]);

  const data = productsRes?.data;
  const collectionFilters = filtersRes?.data;

  return (
    <>
      <FilterOptionsSync options={collectionFilters} collectionSlug={collectionSlug} />
      <ProductList
        products={data?.products ?? []}
        title=""
        pagination={data?.pagination}
      />
    </>
  );
}
