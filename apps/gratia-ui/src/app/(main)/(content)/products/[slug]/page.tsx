import { getProductBySlug } from "@/actions/product";
import ProductDetailPage from "@/components/features/product/ProductDetailPage";
import { logError } from "@/lib/errorHandler";
import { isAuthenticated } from "@/lib/utils/auth";
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

  console.log(data);

  if (!success || !data) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
    };
  }

  return {
    title: data.metaTitle || data.name,
    description: data.metaDescription || data.description,
  };
}

export default async function ProductDetail({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const [productResponse, isLoggedIn] = await Promise.all([
    getCachedProduct(slug),
    isAuthenticated(),
  ]);

  const { data, success } = productResponse;

  if (!success || !data) {
    notFound();
  }

  return <ProductDetailPage productData={data} isLoggedIn={isLoggedIn} />;
}
