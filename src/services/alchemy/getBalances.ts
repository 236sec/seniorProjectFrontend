"use server";

import { env } from "@/env";
import { Alchemy, Network, TokenBalance } from "alchemy-sdk";
import { Utils } from "alchemy-sdk";

const config = {
  apiKey: env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

export interface TokenBalanceData {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number | null;
  logo: string | null;
}

export interface AddressBalancesResponse {
  address: string;
  nativeBalance: string;
  tokenBalances: TokenBalanceData[];
}

export async function getAddressBalances(
  address: string
): Promise<AddressBalancesResponse> {
  try {
    // 1. Get Native Balance (ETH)
    const balanceWei = await alchemy.core.getBalance(address);
    const nativeBalance = Utils.formatEther(balanceWei);

    // 2. Get Token Balances
    const balances = await alchemy.core.getTokenBalances(address);

    // Filter out zero balances
    const nonZeroBalances = balances.tokenBalances.filter((token) => {
      // Very basic check, can use Utils but some tokens return very small hex
      // If hex is "0x00...0", we skip
      return token.tokenBalance && token.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000";
    });

    const tokenDataPromises = nonZeroBalances.map(async (token: TokenBalance) => {
      try {
        const metadata = await alchemy.core.getTokenMetadata(
          token.contractAddress
        );

        let formattedBalance = "0";
        if (token.tokenBalance && metadata.decimals) {
          // Manually format since Utils.formatUnits might throw if decimals is null/undefined
            // But we check decimals exists.
            formattedBalance = (parseInt(token.tokenBalance, 16) / Math.pow(10, metadata.decimals)).toFixed(4);
        }

        return {
          contractAddress: token.contractAddress,
          symbol: metadata.symbol || "UNKNOWN",
          name: metadata.name || "Unknown Token",
          balance: formattedBalance,
          decimals: metadata.decimals || null,
          logo: metadata.logo || null,
        };
      } catch (e) {
        console.error(`Failed to get metadata for ${token.contractAddress}`, e);
        return null;
      }
    });

    const tokens = (await Promise.all(tokenDataPromises)).filter(
      (t) => t !== null
    ) as TokenBalanceData[];

    return {
      address,
      nativeBalance,
      tokenBalances: tokens,
    };
  } catch (error) {
    console.error("Error fetching balances from Alchemy:", error);
    throw new Error("Failed to fetch address balances");
  }
}
