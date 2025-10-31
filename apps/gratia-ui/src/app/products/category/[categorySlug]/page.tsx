import { getProducts } from "@/actions/product";
import ProductList from "@/components/features/ProductList";

export default async function CategoryProductsPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;

  console.log(categorySlug);

  const { data } = await getProducts({ categorySlug });

  return <ProductList products={data?.products ?? []} title="" />;
}
