"use server";

import { apiClient } from "@/lib/apiClient";
import { IApiResponse } from "@/types/Api.types";
import { Brand } from "@/types/Brand.types";

export async function getActiveBrands(): Promise<IApiResponse<Brand[]>> {
  return await apiClient.get("/brands/active");
}
