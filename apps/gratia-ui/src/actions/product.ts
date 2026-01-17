import { apiClient } from "@/lib/apiClient";
import { IApiResponse } from "@/types/Api.types";
import {
  FilterOptionsResponse,
  ProductDetailResponse,
  ProductListItem,
  ProductListResponse,
  ProductQueryOptionsDto,
} from "@/types/Product.types";

export async function getProducts(
  options: ProductQueryOptionsDto
): Promise<IApiResponse<ProductListResponse>> {
  const queryParams = Object.entries(options)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`);

  const queryString = queryParams.join("&");
  const url = queryString ? `/v2/products?${queryString}` : "/v2/products";
  return await apiClient.get(url);
}

export async function getProductsByCategory(
  categorySlug: string,
  options?: Omit<ProductQueryOptionsDto, "categorySlug">
): Promise<IApiResponse<ProductListResponse>> {
  const queryParams = Object.entries(options || {})
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`);

  const queryString = queryParams.join("&");
  const url = queryString
    ? `/v2/products/category/${categorySlug}?${queryString}`
    : `/v2/products/category/${categorySlug}`;
  return await apiClient.get(url);
}

export async function getProductsByCollection(
  collectionSlug: string,
  options?: Omit<ProductQueryOptionsDto, "collectionSlug">
): Promise<IApiResponse<ProductListResponse>> {
  const queryParams = Object.entries(options || {})
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`);

  const queryString = queryParams.join("&");
  const url = queryString
    ? `/v2/products/collection/${collectionSlug}?${queryString}`
    : `/v2/products/collection/${collectionSlug}`;
  return await apiClient.get(url);
}

export async function getProductBySlug(
  slug: string
): Promise<IApiResponse<ProductDetailResponse>> {
  return await apiClient.get(`/v2/products/${slug}`);
}

export async function getFeaturedProducts(
  limit?: number
): Promise<IApiResponse<ProductListItem[]>> {
  const url = limit ? `/v2/products/featured?limit=${limit}` : "/v2/products/featured";
  return await apiClient.get(url);
}

export async function getFilterOptions(
  categorySlug?: string,
  collectionSlug?: string
): Promise<IApiResponse<FilterOptionsResponse>> {
  if (categorySlug) {
    return await apiClient.get(`/v2/products/category/${categorySlug}/filters`);
  }
  if (collectionSlug) {
    return await apiClient.get(`/v2/products/collection/${collectionSlug}/filters`);
  }
  return await apiClient.get("/v2/products/filters");
}
