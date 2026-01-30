import {
  getFilterOptions,
  getProductsByCollection,
} from "@/actions/product";
import FilterOptionsSync from "@/components/features/product/FilterOptionsSync";
import ProductList from "@/components/features/product/ProductList";

interface CollectionProductsPageProps {
  params: Promise<{ collectionSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CollectionProductsPage({
  params,
  searchParams,
}: CollectionProductsPageProps) {
  const { collectionSlug } = await params;
  const { page } = await searchParams;

  const pageNumber = page ? parseInt(page, 10) : 1;
  const validPage = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;

  const [productsRes, filtersRes] = await Promise.all([
    getProductsByCollection(collectionSlug, {
      page: validPage,
      limit: 12,
    }),
    getFilterOptions(undefined, collectionSlug),
  ]);

  const data = productsRes?.data;
  const collectionFilters = filtersRes?.data;

  return (
    <>
      <FilterOptionsSync options={collectionFilters} />
      <ProductList
        products={data?.products ?? []}
        title=""
        pagination={data?.pagination}
      />
    </>
  );
}
