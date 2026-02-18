import { IApiResponse } from "./Api.types";

export interface IVendor {
  id: number;
  userId: number;
  storeName: string;
  storeSlug: string;
  storeDescription?: string;
  email: string;
  phone?: string;
  logo?: string;
  banner?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateVendorRequest {
  userId: number;
  storeName: string;
  storeSlug: string;
  email: string;
  storeDescription?: string;
  phone?: string;
}

export type ICreateVendorResponse = IApiResponse<IVendor>;

export type IGetMyVendorStoreResponse = IApiResponse<IVendor | null>;
