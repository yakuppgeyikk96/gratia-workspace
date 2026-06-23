"use client";

import { AUTH_QUERY_KEY } from "@/hooks/useAuthQuery";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Single source of truth for "the URL changed, re-check auth". Mounted once
// in the layout so multiple consumers (MainHeader, BottomBar, etc.) share a
// single refetch instead of each running their own useEffect on pathname.
export default function AuthQuerySync() {
  const queryClient = useQueryClient();
  const pathname = usePathname();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
  }, [pathname, queryClient]);

  return null;
}
