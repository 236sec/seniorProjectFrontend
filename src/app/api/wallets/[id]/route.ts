import { auth } from "@/auth";
import { getWallet } from "@/services/getWallet";

async function fetchData(walletId: string) {
  return getWallet({ id: walletId });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const session = await auth();
    if (!session?.user?._id) {
      return Response.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    const walletId = (await params).id;
    const walletData = await fetchData(walletId);

    if (!walletData) {
      return Response.json({ error: "Wallet data not found" }, { status: 404 });
    }

    if (walletData.wallet.userId !== session.user._id) {
      return Response.json(
        { error: "Forbidden - You do not have access to this wallet" },
        { status: 403 }
      );
    }

    return Response.json(walletData, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/wallets/[id]:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
