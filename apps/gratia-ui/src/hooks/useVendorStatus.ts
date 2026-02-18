"use client";

import { getMyVendorStore } from "@/actions/vendor";
import { IVendor } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useVendorStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ["vendor-status"],
    queryFn: () => getMyVendorStore(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const vendor: IVendor | null =
    data?.success && data?.data ? data.data : null;

  return {
    isVendor: vendor !== null,
    vendor,
    isLoading,
  };
}
