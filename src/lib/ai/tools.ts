import {
  TransactionEventType,
  TransactionType,
} from "@/constants/types/api/createTransactionTypes";
// import { addBlockchainWallet } from "@/services/addBlockchainWallet";
import { getAddressBalances } from "@/services/alchemy/getBalances";
// import { createTransaction } from "@/services/createTransaction";
import { getCoin } from "@/services/gecko/getCoin";
import { getHistoricalChart } from "@/services/gecko/getHistoricalChart";
import { getWallet } from "@/services/getWallet";
import { getWalletTransactions } from "@/services/getWalletTransactions";
import { getBlockchainWalletDiff } from "@/services/wallets/getBlockchainWalletDiff";
import { tool, ToolSet } from "ai";
import { z } from "zod";

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
  // including execute function -> no confirmation required
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
  // execute: async (params) => {
  //   const result = await addBlockchainWallet(params);
  //   return JSON.stringify(result);
  // },
});

const addManualTransaction = tool({
  description: "Add a manual transaction to the application wallet",
  inputSchema: z.object({
    walletId: z.string().describe("The application wallet ID"),
    type: z
      .nativeEnum(TransactionType)
      .describe("Transaction type (MANUAL or SYNCED)"),
    event_type: z
      .nativeEnum(TransactionEventType)
      .optional()
      .describe("Event type (DEPOSIT, WITHDRAWAL, SWAP)"),
    tokenId: z.string().optional().describe("The token ID in the database"),
    quantity: z.string().optional().describe("Amount of tokens involved"),
    price_usd: z
      .number()
      .optional()
      .describe("Price in USD at time of transaction"),
    timestamp: z
      .string()
      .optional()
      .describe("Date of transaction ISO string")
      .transform((str) => (str ? new Date(str) : undefined)),
  }),
  // execute: async (params) => {
  //   const result = await createTransaction(params);
  //   return JSON.stringify(result);
  // },
});

const getApplicationWalletInfo = tool({
  description:
    "Get application wallet information including total balance and portfolio performance",
  inputSchema: z.object({
    id: z.string().describe("The application wallet ID"),
  }),
  execute: async (params) => {
    const result = await getWallet(params);
    return JSON.stringify(result);
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
  addManualTransaction,
  getApplicationWalletInfo,
  getApplicationWalletTransactions,
} satisfies ToolSet;
