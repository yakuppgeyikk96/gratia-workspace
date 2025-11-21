import { getProductBySlug } from "@/actions/product";
import ProductDetailPage from "@/components/layout/ProductDetailPage";
import { logError } from "@/lib/errorHandler";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

const getCachedProduct = cache(async (slug: string) => {
  try {
    return await getProductBySlug(slug);
  } catch (error) {
    logError(error);
    return {
      data: null,
      success: false,
    };
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data, success } = await getCachedProduct(slug);

  if (!success || !data?.product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
    };
  }

  return {
    title: data.product.metaTitle || data.product.name,
    description: data.product.metaDescription || data.product.description,
  };
}

export default async function ProductDetail({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const { data, success } = await getCachedProduct(slug);

  if (!success || !data?.product) {
    notFound();
  }

  return <ProductDetailPage productData={data} />;
}
