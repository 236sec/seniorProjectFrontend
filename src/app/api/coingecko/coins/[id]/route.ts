import { getCoin } from "@/services/gecko/getCoin";
import { getSimplePrice } from "@/services/gecko/getSimplePrice";
import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { NextResponse } from "next/server";

async function getData(
  coinParams: Parameters<typeof getCoin>[0],
  simplePriceParams: Parameters<typeof getSimplePrice>[0],
  ttl: number
) {
  "use cache";
  cacheLife({ stale: ttl, revalidate: ttl }); // Set cache life to 300 seconds (5 minutes)
  const [coinData, simplePriceData] = await Promise.all([
    getCoin(coinParams),
    getSimplePrice(simplePriceParams),
  ]);
  return {
    coinData,
    simplePriceData,
  };
}

export async function GET(
  req: Request,
  ctx: RouteContext<"/api/coingecko/coins/[id]">
) {
  const { id } = await ctx.params;
  const coinParameters: Parameters<typeof getCoin>[0] = {
    id,
    localization: false,
    tickers: false,
    market_data: true,
    community_data: false,
    developer_data: false,
    sparkline: false,
    dex_pair_format: "contract_address",
  };
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
    precision: "2",
  };
  const res = await getData(coinParameters, simplePriceParameters, 300);
  if (!res) {
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }

  return NextResponse.json(res);
}
