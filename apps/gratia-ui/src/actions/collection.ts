"use server";

import { apiClient } from "@/lib/apiClient";
import { IApiResponse } from "@/types/Api.types";
import { Collection } from "@/types/Collection.types";
import { unstable_cache } from "next/cache";

export async function getActiveCollections(): Promise<
  IApiResponse<Collection[]>
> {
  const cached = unstable_cache(
    () => apiClient.get<Collection[]>("/collections/active"),
    ["collections:active"],
    { revalidate: 60, tags: ["collections"] },
  );
  return await cached();
}
