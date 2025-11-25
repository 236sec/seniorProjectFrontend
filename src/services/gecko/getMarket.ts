"use server";
import {
  GetMarketData,
  GetMarketParams,
} from "@/constants/types/api/gecko/getMarketTypes";
import { env } from "@/env";

export async function getMarket(
  data: GetMarketParams
): Promise<GetMarketData[] | undefined> {
  const params = new URLSearchParams({
    per_page: data.per_page.toString(),
    page: data.page.toString(),
    vs_currency: data.vs_currency || "usd",
    include_tokens: data.include_tokens || "top",
    precision: (data.precision || 2).toString(),
  });

  const coingeckoApiUrl = env.COINGECKO_API_URL;
  const response = await fetch(
    `${coingeckoApiUrl}/coins/markets?${params.toString()}`,
    {
      method: "GET",
    }
  );
  // For debugging cache hit or miss
  // const dateHeader = response.headers.get("date");
  // console.log("[Fetched at]", dateHeader);
  if (response.ok) {
    const data: GetMarketData[] = await response.json();
    return data;
  }
}
