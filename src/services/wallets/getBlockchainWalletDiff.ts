"use server";

import {
  GetBlockchainWalletDiffParams,
  GetBlockchainWalletDiffResponse,
} from "@/constants/types/api/wallets/getBlockchainWalletDiffTypes";
import { env } from "@/env";

export async function getBlockchainWalletDiff(
  data: GetBlockchainWalletDiffParams
): Promise<GetBlockchainWalletDiffResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(
      `${backendUrl}/wallets/blockchainWallets/${data.blockchainWalletId}/diff`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const responseData =
        (await response.json()) as GetBlockchainWalletDiffResponse;
      return responseData;
    } else {
      console.error(
        `Get blockchain wallet diff failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Get blockchain wallet diff fetch failed:", error);
    return undefined;
  }
}
