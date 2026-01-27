"use server";

import {
    AddBankWalletParams,
    AddBankWalletResponse,
} from "@/constants/types/api/wallets/addBankWalletTypes";
import { env } from "@/env";

export async function addBankWallet(
  data: AddBankWalletParams
): Promise<AddBankWalletResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(`${backendUrl}/wallets/bankWallets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = (await response.json()) as AddBankWalletResponse;
      return responseData;
    } else {
      console.error(
        `Add bank wallet failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Add bank wallet fetch failed:", error);
    return undefined;
  }
}
