import { AlchemyChain } from "@/constants/enum/AlchemyChain";
import { TransactionEventType } from "@/constants/types/api/createTransactionTypes";
import z from "zod";

export const get_wallet_input_schema = z.object({
  id: z.string().describe("The application wallet ID"),
});

export const get_wallet_transactions_input_schema = z.object({
  walletId: z.string().describe("The application wallet ID"),
  limit: z
    .number()
    .nullable()
    .describe(
      "Limit the number of transactions returned (default: 10). Set to null for default."
    ),
  offset: z
    .number()
    .nullable()
    .describe("Offset for pagination (default: 0). Set to null for default."),
});

export const manual_transaction_item_schema = z.object({
  event_type: z
    .enum(TransactionEventType)
    .describe("Event type (DEPOSIT, WITHDRAWAL)"),
  coingeckoId: z
    .string()
    .describe("The CoinGecko ID for the token (e.g. 'bitcoin', 'ethereum')"),
  quantity: z.number().describe("Amount of tokens involved"),
  price_usd: z
    .number()
    .describe(
      "Price in USD at time of transaction. Set to 0 to fetch current price."
    ),
});

export const add_manual_transaction_input_schema = z.object({
  walletId: z.string().describe("The application wallet ID"),
  items: z
    .array(manual_transaction_item_schema)
    .describe("List of transaction items to add"),
});

export const get_wallet_info_input_schema = z.object({
  id: z.string().describe("The application wallet ID"),
});

export const get_coin_details_input_schema = z.object({
  id: z.string().describe("The CoinGecko coin ID (e.g. 'bitcoin', 'ethereum')"),
  localization: z
    .boolean()
    .nullable()
    .describe("Include localization data. Set to null for default (false)."),
  tickers: z
    .boolean()
    .nullable()
    .describe("Include ticker data. Set to null for default (false)."),
  market_data: z
    .boolean()
    .nullable()
    .describe("Include market data. Set to null for default (true)."),
  sparkline: z
    .boolean()
    .nullable()
    .describe("Include sparkline data. Set to null for default (false)."),
});

export const get_blockchain_wallet_balances_input_schema = z.object({
  address: z.string().describe("The wallet address to check"),
  chains: z
    .array(z.enum(AlchemyChain))
    .nullable()
    .describe(
      "List of chains to check (e.g. 'eth-mainnet', 'polygon-mainnet'). Set to null for all supported chains."
    ),
});

export const add_blockchain_wallet_input_schema = z.object({
  walletId: z.string().describe("The application wallet ID"),
  address: z.string().describe("The blockchain address to add"),
  chains: z
    .array(z.enum(AlchemyChain))
    .describe("List of chains to track for this wallet"),
});

export const get_blockchain_wallet_token_diffs_input_schema = z.object({
  address: z.string().describe("The blockchain wallet address"),
  walletId: z.string().describe("The application wallet ID"),
});
