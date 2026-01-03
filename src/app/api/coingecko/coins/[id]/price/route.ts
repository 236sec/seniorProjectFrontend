import { getSimplePrice } from "@/services/gecko/getSimplePrice";
import { NextResponse } from "next/server";

async function getData(
  simplePriceParams: Parameters<typeof getSimplePrice>[0],
  ttl: number
) {
  const [simplePriceData] = await Promise.all([
    getSimplePrice(simplePriceParams, ttl),
  ]);
  return {
    simplePriceData,
  };
}

export async function GET(
  req: Request,
  ctx: RouteContext<"/api/coingecko/coins/[id]/price">
) {
  const { id } = await ctx.params;
  const simplePriceParameters: Parameters<typeof getSimplePrice>[0] = {
    ids: [id],
    vs_currencies: ["usd"],
    names: [],
    symbols: [],
    include_tokens: "top",
    include_market_cap: true,
    include_24hr_vol: true,
    include_24hr_change: true,
    include_last_updated_at: true,
    precision: "18",
  };
  const res = await getData(simplePriceParameters, 300);
  if (!res) {
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }

  return NextResponse.json(res);
}
