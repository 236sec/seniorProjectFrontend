import { getAddressBalances } from "@/services/alchemy/getBalances";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
): Promise<Response> {
  try {
    const { address } = await params;

    // Validate address format
    if (!address || !address.startsWith("0x") || address.length !== 42) {
      return Response.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    const data = await getAddressBalances(address);
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in balances API route:", error);
    return Response.json(
      { error: "Failed to fetch address balances" },
      { status: 500 }
    );
  }
}
