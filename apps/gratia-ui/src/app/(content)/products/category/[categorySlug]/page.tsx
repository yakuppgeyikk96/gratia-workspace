import { getProducts } from "@/actions/product";
import ProductList from "@/components/features/ProductList";

export default async function CategoryProductsPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;

  const { data } = await getProducts({ categorySlug });

  console.log(data);

  return <ProductList products={data?.products ?? []} title="" />;
}
