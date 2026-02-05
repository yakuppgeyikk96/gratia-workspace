"use client";

import Pagination, {
  type PaginationInfo,
} from "@gratia/ui/components/Pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

interface OrderHistoryPaginationProps {
  pagination: PaginationInfo;
}

export default function OrderHistoryPagination({
  pagination,
}: OrderHistoryPaginationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentParamsString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    return params.toString();
  }, [searchParams]);

  const handlePaginationChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(currentParamsString);
      if (page > 1) {
        params.set("page", page.toString());
      }
      const queryString = params.toString();
      const newUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;
      router.push(newUrl);
    },
    [pathname, router, currentParamsString]
  );

  return (
    <Pagination
      pagination={pagination}
      onPaginationChange={handlePaginationChange}
    />
  );
}
