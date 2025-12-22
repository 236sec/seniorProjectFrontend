"use server";

import {
  CreateTransactionRequest,
  CreateTransactionResponse,
} from "@/constants/types/api/createTransactionTypes";
import { env } from "@/env";

export async function createTransaction(
  data: CreateTransactionRequest
): Promise<CreateTransactionResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(`${backendUrl}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = (await response.json()) as CreateTransactionResponse;
      return responseData;
    } else {
      console.error(
        `Create transaction failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Create transaction fetch failed:", error);
    return undefined;
  }
}
