"use server";
import {
  GetMarketData,
  GetMarketParams,
} from "@/constants/types/api/gecko/getMarketTypes";
import { env } from "@/env";

export async function getMarket(
  data: GetMarketParams
): Promise<GetMarketData[] | undefined> {
  try {
    const params = new URLSearchParams({
      per_page: data.per_page.toString(),
      page: data.page.toString(),
      vs_currency: data.vs_currency || "usd",
      include_tokens: data.include_tokens || "top",
      precision: (data.precision || 2).toString(),
    });

    const coingeckoApiUrl = env.COINGECKO_API_URL;
    const url = `${coingeckoApiUrl}/coins/markets?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
    });
    // For debugging cache hit or miss
    // const dateHeader = response.headers.get("date");
    // console.log("[Fetched at]", dateHeader);
    if (response.ok) {
      const data: GetMarketData[] = await response.json();
      return data;
    } else {
      console.error(
        `Get market failed with status: ${response.status} ${response.statusText} - URL: ${url}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Get market fetch failed:", error);
    return undefined;
  }
}
