import { getBlockchainWalletDiff } from "@/services/wallets/getBlockchainWalletDiff";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ blockchainWalletId: string }> }
): Promise<Response> {
  try {
    const { blockchainWalletId } = await params;

    if (!blockchainWalletId) {
      return Response.json(
        { error: "Blockchain wallet ID is required" },
        { status: 400 }
      );
    }

    const diffData = await getBlockchainWalletDiff({ blockchainWalletId });

    if (!diffData) {
      return Response.json(
        { error: "Failed to fetch wallet differences" },
        { status: 500 }
      );
    }

    return Response.json(diffData, { status: 200 });
  } catch (error) {
    console.error(
      `Error in GET /api/wallets/blockchainWallets/${await params.then(
        (p) => p.blockchainWalletId
      )}/diff:`,
      error
    );
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
