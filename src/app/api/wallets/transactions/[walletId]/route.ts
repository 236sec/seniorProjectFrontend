import { getWalletTransactions } from "@/services/getWalletTransactions";
import { NextResponse } from "next/server";
import { z } from "zod";

const queryParamsSchema = z.object({
  limit: z.coerce.number().positive().optional().default(10),
  offset: z.coerce.number().nonnegative().optional().default(0),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ walletId: string }> }
): Promise<Response> {
  try {
    const { walletId } = await params;

    // Validate walletId (basic check for MongoDB ObjectId format)
    if (!walletId || !/^[a-f\d]{24}$/i.test(walletId)) {
      return NextResponse.json(
        { error: "Invalid wallet ID format" },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    };

    const parsed = queryParamsSchema.safeParse(queryParams);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const data = await getWalletTransactions({
      walletId,
      limit: parsed.data.limit,
      offset: parsed.data.offset,
    });

    if (!data) {
      return NextResponse.json(
        { error: "Failed to fetch wallet transactions" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/wallets/transactions/[walletId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
