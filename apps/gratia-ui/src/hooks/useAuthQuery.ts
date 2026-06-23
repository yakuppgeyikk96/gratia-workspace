"use client";

import { getCurrentUser } from "@/actions/auth";
import { IAuthUser } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

// Server-authoritative auth state: a TanStack Query against /api/auth/me
// driven by a server action that reads the HttpOnly token. The server
// validates JWT signature + expiry, so this hook automatically reflects
// expired/revoked sessions on the next refetch.
//
// We refetch on pathname change (catches login/register redirects) and on
// window focus (catches token expiry while idle and logouts from other tabs).
// The logout click handler should call queryClient.setQueryData(AUTH_QUERY_KEY,
// null) before invoking logoutUser() so UI flips immediately when the redirect
// target is the current path.
export const useAuthQuery = () => {
  const pathname = usePathname();
  const query = useQuery<IAuthUser | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const res = await getCurrentUser();
      return res.success && res.data ? res.data : null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
  });

  useEffect(() => {
    query.refetch();
    // refetch identity is stable across renders for a given QueryClient
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return query;
};
