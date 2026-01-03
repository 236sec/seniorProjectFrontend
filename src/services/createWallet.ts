"use server";

import {
  CreateWalletRequest,
  CreateWalletResponse,
} from "@/constants/types/api/createWalletTypes";
import { env } from "@/env";

export async function createWallet(
  data: CreateWalletRequest
): Promise<CreateWalletResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const queryParams = new URLSearchParams({
      userId: data.params.userId,
    });

    const response = await fetch(
      `${backendUrl}/wallets?${queryParams.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.body),
      }
    );

    if (response.ok) {
      const responseData = (await response.json()) as CreateWalletResponse;
      return responseData;
    } else {
      console.error(
        `Create wallet failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Create wallet fetch failed:", error);
    return undefined;
  }
}
