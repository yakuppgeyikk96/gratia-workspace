"use client";

import { getCurrentUser } from "@/actions/auth";
import { IAuthUser } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

// Server-authoritative auth state: a TanStack Query against /api/auth/me
// driven by a server action that reads the HttpOnly token. The server
// validates JWT signature + expiry, so this hook automatically reflects
// expired/revoked sessions on the next refetch.
//
// Pathname-based invalidation (for login/logout redirects) lives in
// <AuthQuerySync /> mounted once at the layout level — keeping it here would
// fire one refetch per consumer (MainHeader + BottomBar = 2 calls per nav).
// Logout handlers should call queryClient.setQueryData(AUTH_QUERY_KEY, null)
// before invoking logoutUser() so the UI flips even when the redirect target
// equals the current path.
export const useAuthQuery = () => {
  return useQuery<IAuthUser | null>({
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
};
