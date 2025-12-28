"use server";

import {
  GetWalletTransactionsParams,
  GetWalletTransactionsResponse,
} from "@/constants/types/api/getWalletTransactionsTypes";
import { env } from "@/env";

export async function getWalletTransactions(
  params: GetWalletTransactionsParams
): Promise<GetWalletTransactionsResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;
    const { walletId, limit = 10, offset = 0 } = params;

    // Build query parameters
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(
      `${backendUrl}/wallets/transactions/${walletId}?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const responseData =
        (await response.json()) as GetWalletTransactionsResponse;
      return responseData;
    } else {
      console.error(
        `Get wallet transactions failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Error in getWalletTransactions:", error);
    return undefined;
  }
}
