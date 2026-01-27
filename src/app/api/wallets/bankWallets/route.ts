import { AddBankWalletParams } from "@/constants/types/api/wallets/addBankWalletTypes";
import { addBankWallet } from "@/services/wallets/addBankWallet";

export async function POST(request: Request): Promise<Response> {
  try {
    const body: AddBankWalletParams = await request.json();

    if (!body.walletId || !body.apiKey || !body.apiSecret) {
      return Response.json(
        { error: "Missing required fields: walletId, apiKey, apiSecret" },
        { status: 400 }
      );
    }

    const result = await addBankWallet(body);

    if (!result) {
      return Response.json(
        { error: "Failed to add bank wallet" },
        { status: 500 }
      );
    }

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/wallets/bankWallets:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
