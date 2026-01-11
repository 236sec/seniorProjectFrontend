import { auth } from "@/auth";
import {
  TransactionEventType,
  TransactionType,
} from "@/constants/types/api/createTransactionTypes";
import { createBatchTransactions } from "@/services/createBatchTransactions";
import { z } from "zod";

const batchItemSchema = z.object({
  type: z.literal(TransactionType.SYNCED),
  blockchainWalletId: z.string(),
  tokenContractId: z.string(),
  event_type: z.nativeEnum(TransactionEventType),
  quantity: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  price_usd: z.number().optional(),
  cashflow_usd: z.number().optional(),
  timestamp: z.string().datetime(),
});

const requestSchema = z.object({
  walletId: z.string(),
  items: z.array(batchItemSchema),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const session = await auth();
    if (!session?.user?._id) {
      return Response.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request parameters", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const transactions = await createBatchTransactions(parsed.data);

    if (!transactions) {
      return Response.json(
        { error: "Failed to create batch transactions" },
        { status: 500 }
      );
    }

    return Response.json(transactions, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/transactions/batch:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
