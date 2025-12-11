"use server";

import {
  GetSimplePriceData,
  GetSimplePriceParams,
} from "@/constants/types/api/gecko/getSimplePriceTypes";
import { env } from "@/env";

export async function getSimplePrice(
  data: GetSimplePriceParams,
  ttl: number
): Promise<GetSimplePriceData | undefined> {
  try {
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
    const url = `${coingeckoApiUrl}/simple/price?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      next: { revalidate: ttl },
    });
    // For debugging cache hit or miss
    // const dateHeader = response.headers.get("date");
    // console.log("[Fetched at]", dateHeader);
    if (response.ok) {
      const data: GetSimplePriceData = await response.json();
      return data;
    } else {
      console.error(
        `Get simple price failed with status: ${response.status} ${response.statusText} - URL: ${url}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Get simple price fetch failed:", error);
    return undefined;
  }
}
