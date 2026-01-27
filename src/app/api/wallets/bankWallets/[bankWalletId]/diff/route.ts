import { getBankWalletDiff } from "@/services/wallets/getBankWalletDiff";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bankWalletId: string }> }
): Promise<Response> {
  try {
    const { bankWalletId } = await params;

    if (!bankWalletId) {
      return Response.json(
        { error: "Bank wallet ID is required" },
        { status: 400 }
      );
    }

    const diffData = await getBankWalletDiff({ bankWalletId });

    if (!diffData) {
      return Response.json(
        { error: "Failed to fetch bank wallet diff" },
        { status: 500 }
      );
    }

    return Response.json(diffData, { status: 200 });
  } catch (error) {
    console.error(
      `Error in GET /api/wallets/bankWallets/${(await params).bankWalletId}/diff:`,
      error
    );
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
