"use server";

import { apiClient } from "@/lib/apiClient";
import { IApiResponse } from "@/types/Api.types";
import { Brand } from "@/types/Brand.types";
import { unstable_cache } from "next/cache";

export async function getActiveBrands(): Promise<IApiResponse<Brand[]>> {
  const cached = unstable_cache(
    () => apiClient.get<Brand[]>("/brands/active"),
    ["brands:active"],
    { revalidate: 60, tags: ["brands"] },
  );
  return await cached();
}
