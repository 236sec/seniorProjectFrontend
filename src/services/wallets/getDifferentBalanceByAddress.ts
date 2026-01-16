"use server";

import {
  GetDifferentBalanceByAddressParams,
  GetDifferentBalanceByAddressResponse,
} from "@/constants/types/api/wallets/getDifferentBalanceByAddressTypes";
import { env } from "@/env";

export async function getDifferentBalanceByAddress(
  data: GetDifferentBalanceByAddressParams
): Promise<GetDifferentBalanceByAddressResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(
      `${backendUrl}/wallets/${data.walletId}/blockchainWallets/address/${data.address}/diff`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const responseData =
        (await response.json()) as GetDifferentBalanceByAddressResponse;
      return responseData;
    } else {
      console.error(
        `Get different balance by address failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Get different balance by address fetch failed:", error);
    return undefined;
  }
}
