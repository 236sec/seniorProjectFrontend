import { AlchemyChain } from "@/constants/enum/AlchemyChain";
import { BatchTransactionItem } from "@/constants/types/api/createBatchTransactionsTypes";
import { TransactionType } from "@/constants/types/api/createTransactionTypes";
import { GetWalletResponse } from "@/constants/types/api/getWalletTypes";
import { addBlockchainWallet } from "@/services/addBlockchainWallet";
import { getAddressBalances } from "@/services/alchemy/getBalances";
import { createBatchTransactions } from "@/services/createBatchTransactions";
import { getCoin } from "@/services/gecko/getCoin";
import { getHistoricalChart } from "@/services/gecko/getHistoricalChart";
import { getSimplePrice } from "@/services/gecko/getSimplePrice";
import { getWallet } from "@/services/getWallet";
import { getWalletTransactions } from "@/services/getWalletTransactions";
import { getDifferentBalanceByAddress } from "@/services/wallets/getDifferentBalanceByAddress";
import { tool, ToolSet } from "ai";
import { Utils } from "alchemy-sdk";
import { z } from "zod";
import { getCurrentTimestamp, isErrorService } from "../utils";
import {
  add_blockchain_wallet_input_schema,
  add_manual_transaction_input_schema,
  get_blockchain_wallet_balances_input_schema,
  get_blockchain_wallet_token_diffs_input_schema,
  get_coin_details_input_schema,
  get_wallet_info_input_schema,
  get_wallet_transactions_input_schema,
} from "./tool-schema";

const checkWalletAccess = async (
  walletId: string,
  userId?: string
): Promise<{
  wallet: GetWalletResponse | undefined;
  isAuthorized: boolean;
}> => {
  if (!userId) return { wallet: undefined, isAuthorized: false };
  const result = await getWallet({ id: walletId });
  if (!result || isErrorService(result))
    return { wallet: undefined, isAuthorized: false };
  return { wallet: result, isAuthorized: result.wallet.userId === userId };
};

export const createTools = (userId?: string) => {
  return {
    getBlockchainWalletBalance: tool({
      strict: true,
      description:
        "Get blockchain wallet token balance on-chain for any address across multiple chains. Use this tool to inspect balances before adding a wallet.",
      inputSchema: get_blockchain_wallet_balances_input_schema,
      execute: async ({ address, chains }) => {
        const chainsArg =
          chains && chains.length > 0 ? chains : Object.values(AlchemyChain);
        const result = await getAddressBalances(
          { address, chains: chainsArg },
          60
        );
        if (!result || isErrorService(result)) {
          throw new Error("Failed to fetch balances");
        }
        return JSON.stringify(result);
      },
    }),

    getCoinDetails: tool({
      strict: true,
      description:
        "Get detailed information about a specific coin from CoinGecko",
      inputSchema: get_coin_details_input_schema,
      execute: async (params) => {
        const result = await getCoin(
          {
            ...params,
            localization: params.localization ?? false,
            tickers: params.tickers ?? false,
            market_data: params.market_data ?? true,
            sparkline: params.sparkline ?? false,
          },
          60
        );
        if (!result || isErrorService(result)) {
          throw new Error("Failed to fetch coin details");
        }
        return JSON.stringify(result);
      },
    }),

    getTokenHistoricalChart: tool({
      strict: true,
      description: "Get historical chart price data for a coin",
      inputSchema: z.object({
        id: z.string().describe("The CoinGecko coin ID"),
        days: z
          .number()
          .nullable()
          .describe(
            "Data up to number of days ago (e.g. 1, 14, 30, max). Set to null for default (30)."
          ),
        interval: z
          .enum(["daily"])
          .nullable()
          .describe("Data interval. Set to null for default."),
      }),
      execute: async ({ id, days, interval }) => {
        const result = await getHistoricalChart(
          { id, days: days ?? 30, interval: interval ?? "daily" },
          60
        );
        if (!result || isErrorService(result)) {
          throw new Error("Failed to fetch historical chart");
        }
        return JSON.stringify(result);
      },
    }),

    getBlockchainTokenDiff: tool({
      strict: true,
      description:
        "Get tokens that are in the blockchain wallet but not yet synced to the application wallet",
      inputSchema: get_blockchain_wallet_token_diffs_input_schema,
      execute: async (params) => {
        const { isAuthorized } = await checkWalletAccess(
          params.walletId,
          userId
        );
        if (!isAuthorized) {
          throw new Error("Unauthorized access to this wallet");
        }
        const result = await getDifferentBalanceByAddress(params);
        if (!result || isErrorService(result)) {
          throw new Error("Failed to fetch wallet diff");
        }
        return JSON.stringify(result);
      },
    }),

    addBlockchainWalletToApp: tool({
      strict: true,
      needsApproval: true,
      description: "Add a blockchain wallet address to an application wallet",
      inputSchema: add_blockchain_wallet_input_schema,
      execute: async (params) => {
        const { isAuthorized } = await checkWalletAccess(
          params.walletId,
          userId
        );
        if (!isAuthorized) {
          throw new Error("Unauthorized access to this wallet");
        }
        const result = await addBlockchainWallet(params);
        if (!result || isErrorService(result)) {
          throw new Error("Failed to add blockchain wallet");
        }
        return JSON.stringify(result);
      },
    }),

    addManualTransactionsItems: tool({
      strict: true,
      needsApproval: true,
      description:
        "Add manual transactions to the application wallet. You must provide the 'walletId' and a list of 'items' to add.",
      inputSchema: add_manual_transaction_input_schema,
      execute: async (params) => {
        const { isAuthorized } = await checkWalletAccess(
          params.walletId,
          userId
        );
        if (!isAuthorized) {
          throw new Error("Unauthorized access to this wallet");
        }

        const coingeckoIdsToFetch: string[] = [];
        for (const item of params.items) {
          if (item.price_usd === 0 || item.price_usd === undefined) {
            coingeckoIdsToFetch.push(item.coingeckoId);
          }
        }
        const prices = await getSimplePrice(
          {
            ids: coingeckoIdsToFetch,
            vs_currencies: ["usd"],
            names: [],
            symbols: [],
            include_tokens: "top",
            include_market_cap: true,
            include_24hr_vol: true,
            include_24hr_change: true,
            include_last_updated_at: true,
            precision: "18",
          },
          300
        );
        const newItems: BatchTransactionItem[] = params.items.map((item) => {
          const current_price = prices ? prices[item.coingeckoId]?.usd || 0 : 0;
          const hexQuantity = Utils.parseUnits(
            item.quantity.toString(),
            18
          ).toHexString();
          const qty = parseFloat(item.quantity.toString());
          const timestamp = getCurrentTimestamp();

          if (item.price_usd !== 0 && item.price_usd !== undefined) {
            const price = parseFloat(item.price_usd.toString());
            const total = qty * price;
            const cashflow_usd = parseFloat(total.toPrecision(18));

            return {
              ...item,
              type: TransactionType.MANUAL,
              quantity: hexQuantity,
              cashflow_usd,
              timestamp,
            };
          }

          const total = qty * current_price;
          const cashflow_usd = parseFloat(total.toPrecision(18));

          return {
            ...item,
            type: TransactionType.MANUAL,
            price_usd: current_price,
            quantity: hexQuantity,
            cashflow_usd,
            timestamp,
          };
        });
        const result = await createBatchTransactions({
          walletId: params.walletId,
          items: newItems,
        });
        if (!result || isErrorService(result)) {
          throw new Error("Failed to add transactions");
        } else {
          return JSON.stringify({ success: true });
        }
      },
    }),

    getApplicationWalletInfo: tool({
      strict: true,
      description:
        "Get application wallet information including total balance and portfolio performance",
      inputSchema: get_wallet_info_input_schema,
      execute: async (params) => {
        const { isAuthorized } = await checkWalletAccess(params.id, userId);
        if (!isAuthorized) {
          throw new Error("Unauthorized access to this wallet");
        }

        const result = await getWallet(params);
        if (!result || isErrorService(result)) {
          throw new Error("Wallet not found");
        }

        // Normalize wallet data for AI consumption
        const normalizedResult = {
          walletId: result.wallet._id,
          name: result.wallet.name,
          description: result.wallet.description,
          blockchainAddresses: result.wallet.blockchainWalletId.map((bw) => ({
            address: bw.address,
            chains: bw.chains,
            tokenCount: bw.tokens.length,
            tokens: bw.tokens.map((t) => ({
              nameToken:
                result.tokens[t.tokenContractId.tokenId]?.name || "Unknown",
              balance: t.balance,
            })),
          })),
          tokens: Object.entries(result.tokens).map(([tokenId, details]) => {
            // Find balance from blockchain wallets
            const tokenBalance = result.wallet.blockchainWalletId
              .flatMap((bw) => bw.tokens)
              .find((t) => t.tokenContractId.tokenId === tokenId);

            // Find portfolio performance
            const performance = result.wallet.portfolioPerformance.find(
              (p) => p.tokenId === tokenId
            );

            return {
              id: details.id,
              name: details.name,
              symbol: details.symbol,
              currentPrice: details.currentPrice,
              priceChange24h: details.priceChange24h,
              balance: tokenBalance?.balance || "0x0",
              totalInvestedAmount: performance?.totalInvestedAmount || 0,
              totalCashflowUsd: performance?.totalCashflowUsd || 0,
            };
          }),
          portfolioSummary: {
            totalTokens: Object.keys(result.tokens).length,
            totalInvested: result.wallet.portfolioPerformance.reduce(
              (sum, p) => sum + p.totalInvestedAmount,
              0
            ),
            totalCashflow: result.wallet.portfolioPerformance.reduce(
              (sum, p) => sum + p.totalCashflowUsd,
              0
            ),
          },
        };
        return JSON.stringify(normalizedResult);
      },
    }),

    getApplicationWalletTransactions: tool({
      strict: true,
      description: "Get transactions history for an application wallet",
      inputSchema: get_wallet_transactions_input_schema,
      execute: async (params) => {
        const { isAuthorized } = await checkWalletAccess(
          params.walletId,
          userId
        );
        if (!isAuthorized) {
          throw new Error("Unauthorized access to this wallet");
        }

        const result = await getWalletTransactions({
          walletId: params.walletId,
          limit: params.limit ?? 10,
          offset: params.offset ?? 0,
        });
        if (!result || isErrorService(result)) {
          throw new Error("Transactions not found");
        }
        return JSON.stringify(result);
      },
    }),
  } satisfies ToolSet;
};

export const tools = createTools(undefined);
