"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface ChargeRequestResult {
  chargeRequest: {
    id: string;
    amount: number;
    identifierCode: string;
    expiresAt: string;
    instructions: string;
    bankInfo: {
      bankName: string;
      branchName: string;
      accountType: string;
      accountNumber: string;
      accountHolder: string;
    };
  };
}

export interface ChargeRequestPayload {
  amount: number;
}

/**
 * Hook to create a charge request (credit top-up)
 * @param handle - Creator handle (optional, uses default API if not provided)
 * @returns Mutation with mutate function, loading state, and error
 */
export function useChargeRequest(handle?: string) {
  const queryClient = useQueryClient();

  return useMutation<ChargeRequestResult, Error, ChargeRequestPayload>({
    mutationFn: async ({ amount }: ChargeRequestPayload) => {
      const url = handle ? `/api/${handle}/credits/charge` : "/api/fans/credits/charge";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "チャージ申請に失敗しました");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate credits cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["credits", handle] });
    },
  });
}

/**
 * Hook to validate charge amount
 * @param amount - Amount to validate
 * @returns Validation result with error message if invalid
 */
export function useValidateChargeAmount(amount: number | string): {
  isValid: boolean;
  error: string | null;
} {
  const numAmount = typeof amount === "string" ? parseInt(amount, 10) : amount;

  if (isNaN(numAmount)) {
    return { isValid: false, error: "有効な金額を入力してください" };
  }

  if (numAmount < 1000) {
    return { isValid: false, error: "チャージ金額は1,000円以上で入力してください" };
  }

  if (numAmount > 100000) {
    return { isValid: false, error: "チャージ金額は100,000円以下で入力してください" };
  }

  return { isValid: true, error: null };
}
