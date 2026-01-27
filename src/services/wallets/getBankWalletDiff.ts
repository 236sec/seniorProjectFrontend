"use server";

import {
    GetBankWalletDiffParams,
    GetBankWalletDiffResponse,
} from "@/constants/types/api/wallets/getBankWalletDiffTypes";
import { env } from "@/env";

export async function getBankWalletDiff(
  data: GetBankWalletDiffParams
): Promise<GetBankWalletDiffResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(
      `${backendUrl}/wallets/bankWallets/${data.bankWalletId}/diff`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const responseData = (await response.json()) as GetBankWalletDiffResponse;
      return responseData;
    } else {
      console.error(
        `Get bank wallet diff failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Get bank wallet diff fetch failed:", error);
    return undefined;
  }
}
