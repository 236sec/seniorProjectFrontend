"use server";

import { CreateBatchBankTransactionsParams } from "@/constants/types/api/transactions/createBatchBankTransactionsTypes";
import { env } from "@/env";

export async function createBatchBankTransactions(
  bankWalletId: string,
  data: CreateBatchBankTransactionsParams
): Promise<boolean> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(
      `${backendUrl}/transactions/bankWallets/${bankWalletId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      return true;
    } else {
      console.error(
        `Create batch bank transactions failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error("Create batch bank transactions fetch failed:", error);
    return false;
  }
}
