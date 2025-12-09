import { getAddressBalances } from "@/services/alchemy/getBalances";

export async function GET(
  request: Request,
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

    const data = await getAddressBalances({ address });

    if (!data) {
      return Response.json(
        { error: "Failed to fetch address balances" },
        { status: 500 }
      );
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/alchemy/balances/[address]:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
