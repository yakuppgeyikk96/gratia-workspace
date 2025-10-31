export default async function CategoryProductsPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;

  console.log(categorySlug);

  return <div>CategoryProductsPage</div>;
}
