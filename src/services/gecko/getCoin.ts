"use server";

import {
  GetCoinData,
  GetCoinParams,
} from "@/constants/types/api/gecko/getCoinTypes";

export async function getCoin(
  data: GetCoinParams
): Promise<GetCoinData | undefined> {
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

  const response = await fetch(
    `${process.env.COINGECKO_API_URL}/coins/${data.id}?${params.toString()}`,
    {
      method: "GET",
    }
  );
  // For debugging cache hit or miss
  // const dateHeader = response.headers.get("date");
  // console.log("[Fetched at]", dateHeader);
  if (response.ok) {
    const data: GetCoinData = await response.json();
    return data;
  }
}
