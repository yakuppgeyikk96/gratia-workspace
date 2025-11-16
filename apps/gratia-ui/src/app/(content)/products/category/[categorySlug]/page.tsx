import { getCategoryTree } from "@/actions/category";
import { getProducts } from "@/actions/product";
import ProductList from "@/components/features/product/ProductList";
import { CategoryTreeNode } from "@/types";
import { Metadata } from "next";

interface CategoryProductsPageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const getAllCategorySlugs = (categories: CategoryTreeNode[]): string[] => {
  const slugs: string[] = [];

  function traverse(node: CategoryTreeNode) {
    if (node.isActive) {
      slugs.push(node.slug);
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => traverse(child));
    }
  }

  categories.forEach((category) => traverse(category));
  return slugs;
};

export async function generateStaticParams() {
  try {
    const { data: categoryTree } = await getCategoryTree();

    if (!categoryTree || categoryTree.length === 0) {
      return [];
    }

    const slugs = getAllCategorySlugs(categoryTree);

    return slugs.map((slug) => ({
      categorySlug: slug,
    }));
  } catch (error) {
    console.error("Error generating static params for categories:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;

  return {
    title: `Gratia - Products - ${categorySlug}`,
    description: `Discover amazing products in the ${categorySlug} category`,
  };
}

export default async function CategoryProductsPage({
  params,
}: CategoryProductsPageProps) {
  const { categorySlug } = await params;

  /* const pageNumber = page ? parseInt(page, 10) : 1;
  const validPage = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber; */

  try {
    const { data } = await getProducts({
      categorySlug,
    });

    return (
      <ProductList
        products={data?.products ?? []}
        title=""
        pagination={data?.pagination}
      />
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return <ProductList products={[]} title="" pagination={undefined} />;
  }
}

export const revalidate = 60;
