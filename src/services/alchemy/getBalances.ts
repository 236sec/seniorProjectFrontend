"use server";

import {
  GetAddressBalancesParams,
  GetAddressBalancesResponse,
} from "@/constants/types/api/alchemy/getAddressBalancesTypes";
import { env } from "@/env";

interface BackendBalanceResponse {
  address: string;
  chain: string[];
  nativeBalances: Array<{
    contractAddress: string;
    network: string;
    balance: string;
    balanceFormatted: string;
    symbol: string;
  }>;
  balances: Array<{
    contractAddress: string;
    balance: string;
    balanceFormatted: string;
    symbol: string;
    name: string;
    logo: string | null;
    decimals: number | null;
    network: string;
    token?: {
      id: string;
      symbol: string;
      name: string;
      image: {
        thumb: string;
        small: string;
        large: string;
      };
    } | null;
  }>;
  totalTokens: number;
  tokensWithMetadata: number;
}

/**
 * Get address balances from backend API across multiple chains
 */
export async function getAddressBalances(
  data: GetAddressBalancesParams,
  ttl: number,
): Promise<GetAddressBalancesResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;
    const chains = data.chains || ["eth-sepolia", "opt-mainnet"];
    const url = `${backendUrl}/wallets/on-chain/balance?address=${
      data.address
    }&chain=${chains.join(",")}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: ttl },
    });

    if (response.ok) {
      const responseData: BackendBalanceResponse = await response.json();

      return {
        address: responseData.address,
        chains: responseData.chain,
        nativeBalances: responseData.nativeBalances,
        balances: responseData.balances,
        totalTokens: responseData.totalTokens,
        tokensWithMetadata: responseData.tokensWithMetadata,
      };
    } else {
      console.error(
        `Get address balances failed with status: ${response.status} ${response.statusText}`,
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Get address balances fetch failed:", error);
    return undefined;
  }
}
