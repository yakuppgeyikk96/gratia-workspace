"use server";

import { apiClient } from "@/lib/apiClient";
import {
  ICreateVendorRequest,
  ICreateVendorResponse,
  IGetMyVendorStoreResponse,
} from "@/types";
import { getAuthHeader } from "./utils";

const API_BASE_ROUTE = "/vendors";

export async function createVendor(
  request: ICreateVendorRequest
): Promise<ICreateVendorResponse> {
  const response: ICreateVendorResponse = await apiClient.post(
    API_BASE_ROUTE,
    request
  );

  return response;
}

export async function getMyVendorStore(): Promise<IGetMyVendorStoreResponse> {
  const authHeader = await getAuthHeader();

  const response: IGetMyVendorStoreResponse = await apiClient.get(
    `${API_BASE_ROUTE}/my-store`,
    { headers: authHeader }
  );

  return response;
}
