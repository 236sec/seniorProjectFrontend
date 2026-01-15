// import { addBlockchainWallet } from "@/services/addBlockchainWallet";
import { getAddressBalances } from "@/services/alchemy/getBalances";
import { createBatchTransactions } from "@/services/createBatchTransactions";
// import { createTransaction } from "@/services/createTransaction";
import { BatchTransactionItem } from "@/constants/types/api/createBatchTransactionsTypes";
import { TransactionType } from "@/constants/types/api/createTransactionTypes";
import { getCoin } from "@/services/gecko/getCoin";
import { getHistoricalChart } from "@/services/gecko/getHistoricalChart";
import { getSimplePrice } from "@/services/gecko/getSimplePrice";
import { getWallet } from "@/services/getWallet";
import { getWalletTransactions } from "@/services/getWalletTransactions";
import { getBlockchainWalletDiff } from "@/services/wallets/getBlockchainWalletDiff";
import { tool, ToolSet } from "ai";
import { Utils } from "alchemy-sdk";
import { z } from "zod";
import { getCurrentTimestamp, isErrorService } from "../utils";
import { add_manual_transaction_input_schema } from "./tool-schema";

const getWeatherInformation = tool({
  description: "show the weather in a given city to the user",
  inputSchema: z.object({ city: z.string() }),
  outputSchema: z.string(), // must define outputSchema
  // no execute function, we want human in the loop
});

const getLocalTime = tool({
  description: "get the local time for a specified location",
  inputSchema: z.object({ location: z.string() }),
  outputSchema: z.string(),
  needsApproval: true,
  execute: async ({ location }) => {
    console.log(`Getting local time for ${location}`);
    return "10am";
  },
});

const getBlockchainWalletBalance = tool({
  description:
    "Get blockchain wallet token balance for any address across multiple chains",
  inputSchema: z.object({
    address: z.string().describe("The wallet address to check"),
    chains: z
      .array(z.string())
      .optional()
      .describe(
        "List of chains to check (e.g. 'ETH_MAINNET', 'MATIC_MAINNET'). If empty, checks default chains."
      ),
  }),
  execute: async ({ address, chains }) => {
    const result = await getAddressBalances({ address, chains }, 60);
    return JSON.stringify(result);
  },
});

const getCoinDetails = tool({
  description: "Get detailed information about a specific coin from CoinGecko",
  inputSchema: z.object({
    id: z
      .string()
      .describe("The CoinGecko coin ID (e.g. 'bitcoin', 'ethereum')"),
    localization: z.boolean().optional().default(false),
    tickers: z.boolean().optional().default(false),
    market_data: z.boolean().optional().default(true),
    sparkline: z.boolean().optional().default(false),
  }),
  execute: async (params) => {
    const result = await getCoin(params, 60);
    return JSON.stringify(result);
  },
});

const getTokenHistoricalChart = tool({
  description: "Get historical chart price data for a coin",
  inputSchema: z.object({
    id: z.string().describe("The CoinGecko coin ID"),
    days: z
      .number()
      .optional()
      .default(30)
      .describe("Data up to number of days ago (e.g. 1, 14, 30, max)"),
    interval: z.enum(["daily"]).optional().describe("Data interval"),
  }),
  execute: async ({ id, days, interval }) => {
    const result = await getHistoricalChart({ id, days, interval }, 60);
    return JSON.stringify(result);
  },
});

const getBlockchainTokenDiff = tool({
  description:
    "Get tokens that are in the blockchain wallet but not yet synced to the application wallet",
  inputSchema: z.object({
    blockchainWalletId: z
      .string()
      .describe("The ID of the blockchain wallet in the database"),
  }),
  execute: async (params) => {
    const result = await getBlockchainWalletDiff(params);
    return JSON.stringify(result);
  },
});

const addBlockchainWalletToApp = tool({
  description: "Add a blockchain wallet address to an application wallet",
  inputSchema: z.object({
    walletId: z.string().describe("The application wallet ID"),
    address: z.string().describe("The blockchain address to add"),
    chains: z
      .array(z.string())
      .describe("List of chains to track for this wallet"),
  }),
  needsApproval: true,
  // execute: async (params) => {
  //   const result = await addBlockchainWallet(params);
  //   return JSON.stringify(result);
  // },
});

const addManualTransactions = tool({
  needsApproval: true,
  description: "Add manual transactions to the application wallet",
  inputSchema: add_manual_transaction_input_schema,
  execute: async (params) => {
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
      return JSON.stringify({ error: "Failed to add transactions" });
    } else {
      return JSON.stringify({ success: true });
    }
  },
});

const getApplicationWalletInfo = tool({
  description:
    "Get application wallet information including total balance and portfolio performance",
  inputSchema: z.object({
    id: z.string().describe("The application wallet ID"),
  }),
  execute: async (params) => {
    const result = await getWallet(params);
    if (!result || isErrorService(result)) {
      return JSON.stringify({ error: "Wallet not found" });
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
});

const getApplicationWalletTransactions = tool({
  description: "Get transactions history for an application wallet",
  inputSchema: z.object({
    walletId: z.string().describe("The application wallet ID"),
    limit: z.number().optional().default(10),
    offset: z.number().optional().default(0),
  }),
  execute: async (params) => {
    const result = await getWalletTransactions(params);
    if (!result || isErrorService(result)) {
      return JSON.stringify({ error: "Transactions not found" });
    }
    return JSON.stringify(result);
  },
});

export const tools = {
  getWeatherInformation,
  getLocalTime,
  getBlockchainWalletBalance,
  getCoinDetails,
  getTokenHistoricalChart,
  getBlockchainTokenDiff,
  addBlockchainWalletToApp,
  addManualTransactions,
  getApplicationWalletInfo,
  getApplicationWalletTransactions,
} satisfies ToolSet;
