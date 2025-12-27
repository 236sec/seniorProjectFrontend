"use server";

import {
  AddBlockchainWalletRequest,
  AddBlockchainWalletResponse,
} from "@/constants/types/api/addBlockchainWalletTypes";
import { env } from "@/env";

export async function addBlockchainWallet(
  data: AddBlockchainWalletRequest
): Promise<AddBlockchainWalletResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(`${backendUrl}/wallets/blockchainWallets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData =
        (await response.json()) as AddBlockchainWalletResponse;
      return responseData;
    } else {
      console.error(
        `Add blockchain wallet failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Add blockchain wallet fetch failed:", error);
    return undefined;
  }
}
