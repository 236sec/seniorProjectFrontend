import {
  GetWalletResponse,
  PortfolioPerformance,
} from "@/constants/types/api/getWalletTypes";
import { Utils } from "alchemy-sdk";

export interface AggregatedToken {
  id: string;
  name: string;
  symbol: string;
  image: string;
  totalBalance: bigint;
  portfolioPerformance?: PortfolioPerformance;
  currentPrice?: number;
  priceChange24h?: number | null;
  currentValue: number;
  pnlAmount: number;
  pnlPercentage: number;
}

export interface PortfolioSummary {
  totalCurrentValue: number;
  totalInvested: number;
  totalPnlAmount: number;
  totalPnlPercentage: number;
  weighted24hChange: number;
}

/**
 * Formats a balance string, handling hex strings and regular decimals
 * @param balance - The balance to format (can be hex or regular string)
 * @param decimals - Number of decimals (default: 18)
 * @returns Formatted balance string
 */
export function formatBalance(balance: string, decimals: number = 18): string {
  try {
    // Check if it's a hex string
    if (balance.startsWith("0x")) {
      return Utils.formatUnits(balance, decimals);
    }
    return balance;
  } catch (e) {
    void e;
    return balance;
  }
}

/**
 * Aggregates tokens from wallet data and calculates PNL for each token
 * @param walletData - The wallet response data containing tokens and performance
 * @returns Array of aggregated tokens with calculated metrics
 */
/**
 * Aggregates tokens from wallet data and calculates PNL for each token
 * @param walletData - The wallet response data containing tokens and performance
 * @returns Array of aggregated tokens with calculated metrics
 */
export function getAggregatedTokens(
  walletData: GetWalletResponse,
): AggregatedToken[] {
  const tokenMap = new Map<
    string,
    {
      tokenDetails: (typeof walletData.tokens)[string];
      totalBalance: bigint;
      totalInvested: number;
      totalCashflow: number;
      performance?: PortfolioPerformance; // Keep one ref if needed, but we aggregate values
    }
  >();

  // Helper to process token balance
  const addBalance = (tokenId: string, balanceRaw: string) => {
    const tokenDetails = walletData.tokens[tokenId];
    if (!tokenDetails) return;

    if (!tokenMap.has(tokenDetails.id)) {
      tokenMap.set(tokenDetails.id, {
        tokenDetails,
        totalBalance: BigInt(0),
        totalInvested: 0,
        totalCashflow: 0,
      });
    }

    const entry = tokenMap.get(tokenDetails.id)!;
    try {
      if (balanceRaw) {
        entry.totalBalance += BigInt(balanceRaw);
      }
    } catch (e) {
      void e;
      console.error(
        `Invalid balance for ${tokenDetails.symbol}: ${balanceRaw}`,
      );
    }
  };

  // 1. Process Manual Tokens
  walletData.wallet.manualTokens.forEach((token) => {
    addBalance(token.tokenId, token.balance);
  });

  // 2. Process Blockchain Tokens
  walletData.wallet.blockchainWalletId.forEach((wallet) => {
    if (wallet.tokens && Array.isArray(wallet.tokens)) {
      wallet.tokens.forEach((token) => {
        // Handle both structure types if necessary, but strictly typing based on interface
        const tokenId = token.tokenContractId?.tokenId;
        if (tokenId) {
          addBalance(tokenId, token.balance);
        }
      });
    }
  });

  // 3. Process Portfolio Performance (Aggregate stats)
  if (walletData.wallet.portfolioPerformance) {
    walletData.wallet.portfolioPerformance.forEach((perf) => {
      const tokenDetails = walletData.tokens[perf.tokenId];
      if (!tokenDetails) return;

      // Ensure entry exists (even if no current balance, we might have history)
      if (!tokenMap.has(tokenDetails.id)) {
        tokenMap.set(tokenDetails.id, {
          tokenDetails,
          totalBalance: BigInt(0),
          totalInvested: 0,
          totalCashflow: 0,
        });
      }

      const entry = tokenMap.get(tokenDetails.id)!;
      entry.totalInvested += perf.totalInvestedAmount || 0;
      entry.totalCashflow += perf.totalCashflowUsd || 0;

      // Store one performance object for reference if needed (e.g. for creating AggregatedToken)
      // Note: This might be partial if we merged multiple tokens,
      // but UI mainly uses it for "is there performance data?".
      if (!entry.performance) {
        entry.performance = perf;
      }
    });
  }

  // 4. Transform to AggregatedToken
  return Array.from(tokenMap.values()).map((entry) => {
    const {
      tokenDetails,
      totalBalance,
      totalInvested,
      totalCashflow,
      performance,
    } = entry;

    void totalInvested;
    // Calculate values
    // Note: Assuming 18 decimals as per original code.
    // Ideally this should use token metadata decimals.
    const balanceNumber = parseFloat(
      Utils.formatUnits(totalBalance.toString(), 18),
    );
    const currentValue = balanceNumber * (tokenDetails.currentPrice || 0);

    // PNL Logic
    const pnlAmount = currentValue + totalCashflow;
    const investmentBasis = Math.abs(totalCashflow);
    const pnlPercentage =
      investmentBasis > 0 ? (pnlAmount / investmentBasis) * 100 : 0;

    return {
      id: tokenDetails.id,
      name: tokenDetails.name,
      symbol: tokenDetails.symbol,
      image: tokenDetails.image?.small || "",
      totalBalance: totalBalance,
      portfolioPerformance: performance, // Pass through for potential existing UI checks
      currentPrice: tokenDetails.currentPrice,
      priceChange24h: tokenDetails.priceChange24h,
      currentValue,
      pnlAmount,
      pnlPercentage,
    };
  });
}

/**
 * Calculates portfolio-wide summary metrics including total value, PNL, and 24h change
 * @param tokens - Array of aggregated tokens
 * @returns Portfolio summary with calculated metrics
 */
export function calculatePortfolioSummary(
  tokens: AggregatedToken[],
): PortfolioSummary {
  let totalCurrentValue = 0;
  let totalInvested = 0;
  let totalCashflow = 0;
  let weighted24hSum = 0;

  tokens.forEach((token) => {
    totalCurrentValue += token.currentValue;
    totalInvested += token.portfolioPerformance?.totalInvestedAmount || 0;
    totalCashflow += token.portfolioPerformance?.totalCashflowUsd || 0;

    // Weight the 24h change by the token's value
    // Only include tokens with valid priceChange24h data
    if (token.priceChange24h !== null && token.priceChange24h !== undefined) {
      weighted24hSum += token.currentValue * token.priceChange24h;
    }
  });

  // PNL = Current Value + Total Cashflow
  // Cashflow is negative for money invested, positive for money withdrawn
  const totalPnlAmount = totalCurrentValue + totalCashflow;
  const investmentBasis = Math.abs(totalCashflow);
  const totalPnlPercentage =
    investmentBasis > 0 ? (totalPnlAmount / investmentBasis) * 100 : 0;

  const weighted24hChange =
    totalCurrentValue > 0 ? weighted24hSum / totalCurrentValue : 0;

  return {
    totalCurrentValue,
    totalInvested,
    totalPnlAmount,
    totalPnlPercentage,
    weighted24hChange,
  };
}

/**
 * Calculates the profit/loss amount from total value and invested amount
 * @param totalCurrentValue - Current total value
 * @param totalInvested - Total amount invested
 * @returns The profit/loss amount
 */
export function calculatePnlAmount(
  totalCurrentValue: number,
  totalInvested: number,
): number {
  return totalCurrentValue - totalInvested;
}

/**
 * Calculates the profit/loss percentage from total value and invested amount
 * @param totalCurrentValue - Current total value
 * @param totalInvested - Total amount invested
 * @returns The profit/loss percentage
 */
export function calculatePnlPercentage(
  totalCurrentValue: number,
  totalInvested: number,
): number {
  return totalInvested > 0
    ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
    : 0;
}

/**
 * Formats a currency value with proper locale formatting
 * @param value - The value to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSign?: boolean;
  },
): string {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSign = false,
  } = options || {};

  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  if (showSign && value > 0) {
    return `+${formatted}`;
  }

  return formatted;
}

/**
 * Formats a percentage value with proper sign and decimals
 * Automatically adjusts decimal places for very small percentages
 * @param value - The percentage value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string with sign
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? "+" : "";
  const absValue = Math.abs(value);

  // If the value would round to 0.00% but isn't actually zero, show more precision
  if (absValue > 0 && absValue < 0.01 && decimals === 2) {
    // Show up to 4 decimal places for very small values
    return `${sign}${value.toFixed(4)}%`;
  }

  return `${sign}${value.toFixed(decimals)}%`;
}
