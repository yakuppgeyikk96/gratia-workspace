"use server";

import { apiClient } from "@/lib/apiClient";
import type { IApiResponse, ICreateProductRequest, IProduct } from "@/types";
import { getAuthHeader } from "./utils";

export const createProductAction = async (
  data: ICreateProductRequest,
): Promise<IApiResponse<IProduct>> => {
  const headers = await getAuthHeader();

  return apiClient.post<IProduct>("/products", data, {
    headers,
  });
};
