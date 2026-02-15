"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface CreditHistory {
  id: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

export interface ChargeRequest {
  id: string;
  amount: number;
  status: string;
  identifierCode: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreditsData {
  credits: number;
  history: CreditHistory[];
  chargeRequests: ChargeRequest[];
}

/**
 * Hook to fetch credits data for a specific creator handle
 * @param handle - Creator handle (optional, uses default API if not provided)
 * @returns Query result with credits data, loading state, and error
 */
export function useCredits(handle?: string) {
  return useQuery<CreditsData>({
    queryKey: ["credits", handle],
    queryFn: async () => {
      const url = handle ? `/api/fans/credits?handle=${handle}` : "/api/fans/credits";
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "クレジット情報の取得に失敗しました");
      }

      return response.json();
    },
    staleTime: 30000,      // 30 seconds - data is considered fresh for this duration
    refetchInterval: 60000, // 60 seconds - auto-refetch every minute
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 1,              // Retry once on failure
  });
}

/**
 * Hook to invalidate credits cache and trigger refetch
 * Useful after purchase or charge operations
 */
export function useInvalidateCredits() {
  const queryClient = useQueryClient();

  return (handle?: string) => {
    queryClient.invalidateQueries({ queryKey: ["credits", handle] });
  };
}

/**
 * Hook to get current credits value from cache without refetching
 * @param handle - Creator handle (optional)
 * @returns Current credits value or 0 if not in cache
 */
export function useCreditsValue(handle?: string): number {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<CreditsData>(["credits", handle]);
  return data?.credits || 0;
}
