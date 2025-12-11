"use server";

import {
  GetCoinData,
  GetCoinParams,
} from "@/constants/types/api/gecko/getCoinTypes";
import { env } from "@/env";

export async function getCoin(
  data: GetCoinParams
): Promise<GetCoinData | undefined> {
  try {
    const params = new URLSearchParams({
      id: data.id,
      localization: data.localization ? "true" : "false",
      tickers: data.tickers ? "true" : "false",
      market_data: data.market_data ? "true" : "false",
      community_data: data.community_data ? "true" : "false",
      developer_data: data.developer_data ? "true" : "false",
      sparkline: data.sparkline ? "true" : "false",
      dex_pair_format: data.dex_pair_format || "contract_address",
    });

    const coingeckoApiUrl = env.COINGECKO_API_URL;
    const url = `${coingeckoApiUrl}/coins/${data.id}?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
    });
    // For debugging cache hit or miss
    // const dateHeader = response.headers.get("date");
    // console.log("[Fetched at]", dateHeader);
    if (response.ok) {
      const data: GetCoinData = await response.json();
      return data;
    } else {
      console.error(
        `Get coin failed with status: ${response.status} ${response.statusText} - URL: ${url}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Get coin fetch failed:", error);
    return undefined;
  }
}
