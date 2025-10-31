import { apiClient } from "@/lib/apiClient";
import { IApiResponse } from "@/types";
import {
  ProductQueryOptionsDto,
  ProductsResponseDto,
} from "@/types/Product.types";

export async function getProducts(
  options: ProductQueryOptionsDto
): Promise<IApiResponse<ProductsResponseDto>> {
  const queryParams = Object.entries(options).map(
    ([key, value]) => `${key}=${value}`
  );
  const queryString = queryParams.join("&");
  return await apiClient.get(`/products?${queryString}`);
}
