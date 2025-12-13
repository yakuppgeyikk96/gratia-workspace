import { IApiResponse } from "./Api.types";

export interface ShippingMethod {
  _id: string;
  name: string;
  carrier: string;
  description?: string;
  estimatedDays: string;
  price: number;
  isFree: boolean;
  imageUrl?: string;
}

export type ShippingMethodResponse = IApiResponse<ShippingMethod[]>;
