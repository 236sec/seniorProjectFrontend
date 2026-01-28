import { CreateBatchBankTransactionsParams } from "@/constants/types/api/transactions/createBatchBankTransactionsTypes";
import { createBatchBankTransactions } from "@/services/transactions/createBatchBankTransactions";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bankWalletId: string }> }
): Promise<Response> {
  try {
    const { bankWalletId } = await params;
    const body: CreateBatchBankTransactionsParams = await request.json();

    if (!bankWalletId) {
      return Response.json(
        { error: "Bank wallet ID is required" },
        { status: 400 }
      );
    }

    if (!body.walletId || !body.items || !Array.isArray(body.items)) {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const success = await createBatchBankTransactions(bankWalletId, body);

    if (!success) {
      return Response.json(
        { error: "Failed to create batch bank transactions" },
        { status: 500 }
      );
    }

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error(
      `Error in POST /api/transactions/bankWallets/${
        (await params).bankWalletId
      }:`,
      error
    );
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
