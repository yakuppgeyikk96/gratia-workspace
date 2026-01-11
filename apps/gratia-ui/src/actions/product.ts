import { apiClient } from "@/lib/apiClient";
import { IApiResponse } from "@/types/Api.types";
import {
  Product,
  ProductQueryOptionsDto,
  ProductsResponseDto,
  ProductWithVariantsDto,
} from "@/types/Product.types";

export async function getProducts(
  options: ProductQueryOptionsDto
): Promise<IApiResponse<ProductsResponseDto>> {
  const queryParams = Object.entries(options).map(
    ([key, value]) => `${key}=${value}`
  );

  queryParams.push("details=true");

  const queryString = queryParams.join("&");
  return await apiClient.get(`/products?${queryString}`);
}

export async function getProductBySlug(
  slug: string
): Promise<IApiResponse<ProductWithVariantsDto>> {
  return await apiClient.get(`/products/${slug}/with-variants`);
}

export async function getFeaturedProducts(): Promise<IApiResponse<Product[]>> {
  return await apiClient.get("/products/featured");
}
