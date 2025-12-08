"use server";

import { env } from "@/env";

export interface TokenBalanceData {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number | null;
  logo: string | null;
  network: string;
}

export interface NativeBalanceData {
  network: string;
  balance: string;
}

export interface AddressBalancesResponse {
  address: string;
  nativeBalances: NativeBalanceData[];
  tokenBalances: TokenBalanceData[];
}

interface AlchemyTokenMetadata {
  decimals: number;
  logo: string | null;
  name: string;
  symbol: string;
}

interface AlchemyTokenPrice {
  currency: string;
  value: string;
  lastUpdatedAt: string;
}

interface AlchemyToken {
  address: string;
  network: string;
  tokenAddress: string | null;
  tokenBalance: string;
  tokenMetadata: AlchemyTokenMetadata;
  tokenPrices: AlchemyTokenPrice[];
  error?: string;
}

interface AlchemyPortfolioResponse {
  data: {
    tokens: AlchemyToken[];
    pageKey?: string;
  };
}

/**
 * Convert raw token balance to human-readable format using decimals
 */
function formatTokenBalance(rawBalance: string, decimals: number): string {
  if (!rawBalance || rawBalance === "0") return "0";

  const balance = BigInt(rawBalance);
  const divisor = BigInt(10 ** decimals);
  const integerPart = balance / divisor;
  const remainder = balance % divisor;

  if (remainder === BigInt(0)) {
    return integerPart.toString();
  }

  const fractionalPart = remainder.toString().padStart(decimals, "0");
  return `${integerPart}.${fractionalPart}`;
}

export async function getAddressBalances(
  address: string
): Promise<AddressBalancesResponse> {
  try {
    // Use Portfolio API to get all token balances in one call
    const portfolioUrl = `https://api.g.alchemy.com/data/v1/${env.ALCHEMY_API_KEY}/assets/tokens/by-address`;

    const portfolioResponse = await fetch(portfolioUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        addresses: [
          {
            address: address,
            networks: ["eth-sepolia", "opt-mainnet"],
          },
        ],
        withMetadata: true,
        withPrices: true,
        includeNativeTokens: true,
        includeErc20Tokens: true,
      }),
      cache: "no-store",
    });

    if (!portfolioResponse.ok) {
      throw new Error(
        `Portfolio API request failed: ${portfolioResponse.statusText}`
      );
    }

    const portfolioData: AlchemyPortfolioResponse =
      await portfolioResponse.json();
    console.log("Portfolio Data:", JSON.stringify(portfolioData));

    // Group native tokens by network (has null tokenAddress)
    const nativeBalances: NativeBalanceData[] = portfolioData.data.tokens
      .filter((token) => token.tokenAddress === null)
      .filter((token) => {
        // Exclude zero balances
        if (!token.tokenBalance || token.tokenBalance === "0") return false;
        if (token.tokenBalance.startsWith("0x")) {
          const normalized = token.tokenBalance.replace(/^0x0+/, "") || "0";
          if (normalized === "0") return false;
        }
        return true;
      })
      .map((token) => ({
        network: token.network,
        balance: formatTokenBalance(token.tokenBalance, 18),
      }));

    // Map ERC-20 tokens to our format (exclude native token and zero balances)
    const tokenBalances: TokenBalanceData[] = portfolioData.data.tokens
      .filter((token) => {
        // Exclude native token
        if (token.tokenAddress === null) return false;

        // Exclude zero balances (handles both "0" and "0x000...000" formats)
        if (!token.tokenBalance || token.tokenBalance === "0") return false;
        if (token.tokenBalance.startsWith("0x")) {
          const normalized = token.tokenBalance.replace(/^0x0+/, "") || "0";
          if (normalized === "0") return false;
        }

        return true;
      })
      .map((token) => ({
        contractAddress: token.tokenAddress as string,
        symbol: token.tokenMetadata?.symbol || "UNKNOWN",
        name: token.tokenMetadata?.name || "Unknown Token",
        balance: formatTokenBalance(
          token.tokenBalance,
          token.tokenMetadata?.decimals || 18
        ),
        decimals: token.tokenMetadata?.decimals || null,
        logo: token.tokenMetadata?.logo || null,
        network: token.network,
      }));

    return {
      address,
      nativeBalances,
      tokenBalances,
    };
  } catch (error) {
    console.error("Error fetching balances from Alchemy:", error);
    throw new Error("Failed to fetch address balances");
  }
}
