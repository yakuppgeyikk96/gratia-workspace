"use server";

import { apiClient } from "@/lib/apiClient";
import { IApiResponse } from "@/types/Api.types";
import { Collection } from "@/types/Collection.types";

export async function getActiveCollections(): Promise<
  IApiResponse<Collection[]>
> {
  return await apiClient.get("/collections/active");
}
