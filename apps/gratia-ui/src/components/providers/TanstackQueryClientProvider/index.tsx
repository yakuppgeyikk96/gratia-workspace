"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function TanstackQueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use lazy initialization to create QueryClient only once
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Queries are fresh for 1 minute by default
            staleTime: 60 * 1000,
            // Cache data for 5 minutes after component unmounts
            gcTime: 5 * 60 * 1000,
            // Don't refetch on window focus for better UX
            refetchOnWindowFocus: false,
            // Retry failed queries once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
