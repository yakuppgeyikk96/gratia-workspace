import { getAllCollectionSlugs } from "@/actions";
import { getProducts } from "@/actions/product";
import ProductList from "@/components/features/product/ProductList";

interface CollectionProductsPageProps {
  params: Promise<{ collectionSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllCollectionSlugs();
  return slugs.map((slug) => ({
    collectionSlug: slug,
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

  const { data } = await getProducts({
    collectionSlug,
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

export const revalidate = 60;
