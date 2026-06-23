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

// Streaming SSR via Suspense: the page component renders only the boundary,
// so the skeleton ships in the first chunk and the data-driven body streams
// in once params + searchParams + the API call resolve. Without PPR (stable
// only on Next.js canary) we don't get a fully prerendered shell, but the
// progressive UX is still a clear win over the old single-shot render.
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
