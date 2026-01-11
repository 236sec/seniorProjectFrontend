"use server";

import {
  CreateBatchTransactionsParams,
  CreateBatchTransactionsResponse,
} from "@/constants/types/api/createBatchTransactionsTypes";
import { env } from "@/env";

export async function createBatchTransactions(
  data: CreateBatchTransactionsParams
): Promise<CreateBatchTransactionsResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(`${backendUrl}/transactions/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData =
        (await response.json()) as CreateBatchTransactionsResponse;
      return responseData;
    } else {
      console.error(
        `Create batch transactions failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Create batch transactions fetch failed:", error);
    return undefined;
  }
}
