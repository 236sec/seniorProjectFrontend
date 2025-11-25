"use server";

import {
  GetSimplePriceData,
  GetSimplePriceParams,
} from "@/constants/types/api/gecko/getSimplePriceTypes";
import { env } from "@/env";

export async function getSimplePrice(
  data: GetSimplePriceParams
): Promise<GetSimplePriceData | undefined> {
  const params = new URLSearchParams({
    ids: data.ids.join(","),
    vs_currencies: data.vs_currencies.join(","),
    names: data.names.join(","),
    symbols: data.symbols.join(","),
    include_tokens: data.include_tokens,
    include_market_cap: data.include_market_cap.toString(),
    include_24hr_vol: data.include_24hr_vol.toString(),
    include_24hr_change: data.include_24hr_change.toString(),
    include_last_updated_at: data.include_last_updated_at.toString(),
    precision: data.precision,
  });

  const coingeckoApiUrl = env.COINGECKO_API_URL;
  const response = await fetch(
    `${coingeckoApiUrl}/simple/price?${params.toString()}`,
    {
      method: "GET",
    }
  );
  // For debugging cache hit or miss
  // const dateHeader = response.headers.get("date");
  // console.log("[Fetched at]", dateHeader);
  if (response.ok) {
    const data: GetSimplePriceData = await response.json();
    return data;
  }
}
