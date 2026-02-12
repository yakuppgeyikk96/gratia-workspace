"use server";

import { apiClient } from "@/lib/apiClient";
import { ICreateVendorRequest, ICreateVendorResponse } from "@/types";

const API_BASE_ROUTE = "/vendors";

export async function createVendor(
  request: ICreateVendorRequest,
): Promise<ICreateVendorResponse> {
  console.log("Creating vendor with request:", request);
  const response: ICreateVendorResponse = await apiClient.post(
    API_BASE_ROUTE,
    request,
  );

  return response;
}
