"use client";

import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/fetcher";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: any) => {
            // Handle API errors gracefully without rate limiting
            if (error instanceof ApiError) {
              // Only show user-friendly errors, not rate limit errors
              if (error.status >= 500) {
                toast.error("Server Error", {
                  description: "The server is temporarily unavailable. Please try again later.",
                  duration: 5000,
                });
              } else if (error.status === 404) {
                toast.error("Not Found", {
                  description: "The requested content could not be found.",
                  duration: 4000,
                });
              }
              // Don't show toast for other errors (like 429) - let them pass silently
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false, // Disable auto refresh on focus
            refetchOnMount: false, // Disable auto refresh on mount
            refetchOnReconnect: false, // Disable auto refresh on network reconnect
            retry: (failureCount, error) => {
              // Don't retry on 404 or client errors
              if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                return false;
              }
              // Retry up to 2 times for server errors
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
