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
  currentPrice: number;
  priceChange24h: number | null;
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
export function getAggregatedTokens(
  walletData: GetWalletResponse
): AggregatedToken[] {
  const tokenMap = new Map<string, AggregatedToken>();

  // Process manual tokens
  walletData.wallet.manualTokens.forEach((token) => {
    const tokenDetails = walletData.tokens[token.tokenId];
    if (!tokenDetails) return;

    const currentBalance = BigInt(token.balance);
    const performance = walletData.wallet.portfolioPerformance.find(
      (p) => p.tokenId === token.tokenId
    );

    // Calculate current value and PNL
    const balanceNumber = parseFloat(Utils.formatUnits(token.balance, 18));
    const currentValue = balanceNumber * tokenDetails.currentPrice;
    const cashflow = performance?.totalCashflowUsd || 0;

    // PNL = Current Value + Total Cashflow
    // Cashflow is negative for money invested, positive for money withdrawn
    // Example: current value $100, cashflow -$80 → PNL = $100 + (-$80) = $20 profit
    // Example: current value $100, cashflow -$120 → PNL = $100 + (-$120) = -$20 loss
    const pnlAmount = currentValue + cashflow;

    // Calculate percentage based on the absolute investment (negative cashflow)
    // Use absolute value of cashflow as the basis for percentage calculation
    const investmentBasis = Math.abs(cashflow);
    const pnlPercentage =
      investmentBasis > 0 ? (pnlAmount / investmentBasis) * 100 : 0;

    tokenMap.set(tokenDetails.id, {
      id: tokenDetails.id,
      name: tokenDetails.name,
      symbol: tokenDetails.symbol,
      image: tokenDetails.image?.small || "",
      totalBalance: currentBalance,
      portfolioPerformance: performance,
      currentPrice: tokenDetails.currentPrice,
      priceChange24h: tokenDetails.priceChange24h,
      currentValue,
      pnlAmount,
      pnlPercentage,
    });
  });

  return Array.from(tokenMap.values());
}

/**
 * Calculates portfolio-wide summary metrics including total value, PNL, and 24h change
 * @param tokens - Array of aggregated tokens
 * @returns Portfolio summary with calculated metrics
 */
export function calculatePortfolioSummary(
  tokens: AggregatedToken[]
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
    if (token.priceChange24h !== null) {
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
  totalInvested: number
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
  totalInvested: number
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
  }
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
