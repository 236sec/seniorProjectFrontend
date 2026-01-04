import { AVAILABLE_CHAINS } from "@/constants/enum/AlchemyChain";
import { addBlockchainWallet } from "@/services/addBlockchainWallet";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  walletId: z.string(),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  chains: z
    .array(z.enum(AVAILABLE_CHAINS as [string, ...string[]]))
    .min(1, "Select at least one chain"),
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

    const data = await addBlockchainWallet(parsed.data);

    if (!data) {
      return NextResponse.json(
        { error: "Failed to add blockchain wallet" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/wallets/blockchain-wallets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
