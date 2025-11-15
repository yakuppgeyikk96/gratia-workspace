import { getProducts } from "@/actions/product";
import ProductList from "@/components/features/product/ProductList";

export default async function CollectionProductsPage({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}) {
  const { collectionSlug } = await params;

  const { data } = await getProducts({ collectionSlug });

  return <ProductList products={data?.products ?? []} title="" />;
}
