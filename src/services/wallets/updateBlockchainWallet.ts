"use server";

import {
  UpdateBlockchainWalletParams,
  UpdateBlockchainWalletResponse,
} from "@/constants/types/api/wallets/updateBlockchainWalletTypes";
import { env } from "@/env";

export async function updateBlockchainWallet(
  data: UpdateBlockchainWalletParams
): Promise<UpdateBlockchainWalletResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(
      `${backendUrl}/blockchain-wallets/${data.blockchainWalletId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chains: data.chains }),
      }
    );

    if (response.ok) {
      const responseData =
        (await response.json()) as UpdateBlockchainWalletResponse;
      return responseData;
    } else {
      console.error(
        `Update blockchain wallet failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Update blockchain wallet fetch failed:", error);
    return undefined;
  }
}
