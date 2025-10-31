export default async function CollectionProductsPage({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}) {
  const { collectionSlug } = await params;
  console.log(collectionSlug);
  return <div>CollectionProductsPage</div>;
}
