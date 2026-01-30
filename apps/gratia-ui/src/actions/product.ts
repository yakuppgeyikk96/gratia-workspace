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
  const url = queryString ? `/products?${queryString}` : "/products";
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
    ? `/products/category/${categorySlug}?${queryString}`
    : `/products/category/${categorySlug}`;
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
    ? `/products/collection/${collectionSlug}?${queryString}`
    : `/products/collection/${collectionSlug}`;
  return await apiClient.get(url);
}

export async function getProductBySlug(
  slug: string
): Promise<IApiResponse<ProductDetailResponse>> {
  return await apiClient.get(`/products/${slug}`);
}

export async function getFeaturedProducts(
  limit?: number
): Promise<IApiResponse<ProductListItem[]>> {
  const url = limit ? `/products/featured?limit=${limit}` : "/products/featured";
  return await apiClient.get(url);
}

export async function getFilterOptions(
  categorySlug?: string,
  collectionSlug?: string
): Promise<IApiResponse<FilterOptionsResponse>> {
  if (collectionSlug) {
    const params = categorySlug
      ? `?categorySlug=${encodeURIComponent(categorySlug)}`
      : "";
    return await apiClient.get(
      `/products/collection/${collectionSlug}/filters${params}`
    );
  }
  if (categorySlug) {
    return await apiClient.get(`/products/category/${categorySlug}/filters`);
  }
  return await apiClient.get("/products/filters");
}
