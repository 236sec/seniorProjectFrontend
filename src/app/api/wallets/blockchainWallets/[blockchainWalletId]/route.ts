import { auth } from "@/auth";
import { AlchemyChain } from "@/constants/enum/AlchemyChain";
import { updateBlockchainWallet } from "@/services/wallets/updateBlockchainWallet";
import { z } from "zod";

const requestSchema = z.object({
  chains: z.array(z.nativeEnum(AlchemyChain)),
});

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/wallets/blockchainWallets/[blockchainWalletId]">
): Promise<Response> {
  try {
    const session = await auth();
    if (!session?.user?._id) {
      return Response.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    const { blockchainWalletId } = await ctx.params;

    if (!blockchainWalletId) {
      return Response.json(
        { error: "Blockchain wallet ID is required" },
        { status: 400 }
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

    const walletData = await updateBlockchainWallet({
      blockchainWalletId,
      chains: parsed.data.chains,
    });

    if (!walletData) {
      return Response.json(
        { error: "Failed to update blockchain wallet" },
        { status: 500 }
      );
    }

    return Response.json(walletData, { status: 200 });
  } catch (error) {
    console.error(
      `Error in PATCH /api/wallets/blockchainWallets/${await ctx.params.then(
        (p) => p.blockchainWalletId
      )}:`,
      error
    );
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
