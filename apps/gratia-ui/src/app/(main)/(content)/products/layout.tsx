import ProductsLayoutClient from "@/components/features/product/ProductsLayoutClient";

export default function ProductsLayout({
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
