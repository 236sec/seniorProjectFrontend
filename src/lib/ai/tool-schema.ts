import { TransactionEventType } from "@/constants/types/api/createTransactionTypes";
import z from "zod";

export const get_wallet_input_schema = z.object({
  id: z.string().describe("The application wallet ID"),
});

export const get_wallet_transactions_input_schema = z.object({
  walletId: z.string().describe("The application wallet ID"),
  limit: z.number().optional().default(10),
  offset: z.number().optional().default(0),
});

export const add_manual_transaction_input_schema = z.object({
  walletId: z.string().describe("The application wallet ID"),
  items: z.array(
    z.object({
      event_type: z
        .nativeEnum(TransactionEventType)
        .describe("Event type (DEPOSIT, WITHDRAWAL)"),
      coingeckoId: z
        .string()
        .describe(
          "The CoinGecko ID for the token (e.g. 'bitcoin', 'ethereum')"
        ),
      quantity: z.number().describe("Amount of tokens involved"),
      price_usd: z
        .number()
        .optional()
        .describe(
          "Price in USD at time of transaction if not provided, will fetch current price"
        ),
    })
  ),
});
