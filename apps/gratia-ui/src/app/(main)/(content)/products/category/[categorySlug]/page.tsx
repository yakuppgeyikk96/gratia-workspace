import { getProducts } from "@/actions/product";
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

  const { data } = await getProducts({
    categorySlug,
    page: validPage,
  });

  return (
    <ProductList
      products={data?.products ?? []}
      title=""
      pagination={data?.pagination}
    />
  );
}
