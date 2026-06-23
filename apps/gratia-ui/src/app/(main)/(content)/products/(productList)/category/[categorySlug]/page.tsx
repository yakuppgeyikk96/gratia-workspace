import { getFilterOptions, getProducts } from "@/actions/product";
import FilterOptionsSync from "@/components/features/product/FilterOptionsSync";
import ProductList from "@/components/features/product/ProductList";
import ProductsLoading from "@/components/features/product/ProductsLoading";
import {
  parseFiltersFromSearchParams,
  parsePageFromSearchParams,
  parseSortFromSearchParams,
} from "@/lib/filterUtils";
import { SortOptions } from "@/types/Product.types";
import { Suspense } from "react";

// Opt-in to Partial Pre-Rendering for this route. The page component only
// renders a Suspense shell — Next.js prerenders that shell at build/idle time
// (CDN-cached), and streams in the data-driven body once searchParams resolve
// at request time.
export const experimental_ppr = true;

interface CategoryProductsPageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function CategoryProductsPage({
  params,
  searchParams,
}: CategoryProductsPageProps) {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <CategoryProducts params={params} searchParams={searchParams} />
    </Suspense>
  );
}

// Anything that awaits params or searchParams lives below the Suspense
// boundary so the prerendered shell stays static.
async function CategoryProducts({
  params,
  searchParams,
}: CategoryProductsPageProps) {
  const [{ categorySlug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const page = parsePageFromSearchParams(resolvedSearchParams);
  const sort = parseSortFromSearchParams(resolvedSearchParams) as
    | SortOptions
    | undefined;
  const filters = parseFiltersFromSearchParams(resolvedSearchParams);

  const [productsRes, filtersRes] = await Promise.all([
    getProducts(
      {
        categorySlug,
        page,
        limit: 12,
        sort,
      },
      filters,
    ),
    getFilterOptions(categorySlug, undefined, filters),
  ]);

  const data = productsRes?.data;
  const categoryFilters = filtersRes?.data;

  return (
    <>
      <FilterOptionsSync
        options={categoryFilters}
        parentCategorySlug={categorySlug}
      />
      <ProductList
        products={data?.products ?? []}
        title=""
        pagination={data?.pagination}
      />
    </>
  );
}
