import { getFilterOptions, searchProducts } from "@/actions/product";
import FilterOptionsSync from "@/components/features/product/FilterOptionsSync";
import ProductList from "@/components/features/product/ProductList";
import {
  parseFiltersFromSearchParams,
  parsePageFromSearchParams,
  parseSortFromSearchParams,
} from "@/lib/filterUtils";
import { SortOptions } from "@/types/Product.types";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";

  // Show warning for short/empty queries
  if (!q || q.trim().length < 2) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "#6b7280" }}>
        <p style={{ fontSize: "16px" }}>Please enter at least 2 characters to search.</p>
      </div>
    );
  }

  // Parse query parameters
  const page = parsePageFromSearchParams(resolvedSearchParams);
  const sort = (parseSortFromSearchParams(resolvedSearchParams) as SortOptions) ?? "relevance";
  const filters = parseFiltersFromSearchParams(resolvedSearchParams);

  // Fetch search results and filter options in parallel
  const [productsRes, filtersRes] = await Promise.all([
    searchProducts(q, sort, page, 12, filters),
    getFilterOptions(undefined, undefined, filters, q),
  ]);

  const data = productsRes?.data;
  const searchFilters = filtersRes?.data;
  const totalResults = data?.pagination?.total ?? 0;

  const products = data?.products ?? [];

  return (
    <>
      <FilterOptionsSync options={searchFilters} />
      {products.length > 0 ? (
        <ProductList
          products={products}
          title={`Search results for "${q}" (${totalResults} results)`}
          pagination={data?.pagination}
        />
      ) : (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#6b7280" }}>
          <p style={{ fontSize: "16px" }}>
            No products found for &quot;{q}&quot;. Try a different search term.
          </p>
        </div>
      )}
    </>
  );
}