import {
  TransactionEventType,
  TransactionType,
} from "@/constants/types/api/createTransactionTypes";
import { createTransaction } from "@/services/createTransaction";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  walletId: z.string(),
  type: z.enum(TransactionType),
  blockchainWalletId: z.string().optional(),
  tokenContractId: z.string().optional(),
  event_type: z.enum(TransactionEventType).optional(),
  quantity: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  price_usd: z.number().optional(),
  cashflow_usd: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request parameters", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = await createTransaction(parsed.data);

    if (!data) {
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
