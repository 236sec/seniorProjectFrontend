import { getAddressBalances } from "@/services/alchemy/getBalances";

async function getData(
  params: Parameters<typeof getAddressBalances>[0],
  ttl: number
) {
  return await getAddressBalances(params, ttl);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
): Promise<Response> {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const chainsParam = searchParams.get("chains");

    // Validate address format
    if (!address || !address.startsWith("0x") || address.length !== 42) {
      return Response.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    // Parse chains parameter
    const chains = chainsParam ? chainsParam.split(",") : undefined;

    const data = await getData({ address, chains }, 60);

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
