import ProductsLayoutClient from "@/components/features/product/ProductsLayoutClient";

export default function ProductListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProductsLayoutClient>
      {children}
    </ProductsLayoutClient>
  );
}
