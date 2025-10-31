import { apiClient } from "@/lib/apiClient";
import { IApiResponse, NavigationResponse } from "@/types";

export async function getNavigationItems(): Promise<
  IApiResponse<NavigationResponse>
> {
  const response: IApiResponse<NavigationResponse> =
    await apiClient.get("/navigation");
  return response;
}
