import { apiClient } from "@/lib/apiClient";
import { IApiResponse, NavigationResponse } from "@/types";
import { unstable_cache } from "next/cache";

export async function getNavigationItems(): Promise<
  IApiResponse<NavigationResponse>
> {
  const cached = unstable_cache(
    () => apiClient.get<NavigationResponse>("/navigation"),
    ["navigation:items"],
    { revalidate: 60, tags: ["navigation", "categories", "collections"] },
  );
  return await cached();
}
