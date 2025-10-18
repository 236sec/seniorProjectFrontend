"use server";
import {
  GetMarketParams,
  GetMarketData,
} from "@/constants/types/api/gecko/getMarketTypes";

export async function getMarket(
  data: GetMarketParams,
  ttl: number
): Promise<GetMarketData[] | undefined> {
  const params = new URLSearchParams({
    per_page: data.per_page.toString(),
    page: data.page.toString(),
    vs_currency: data.vs_currency || "usd",
    include_tokens: data.include_tokens || "top",
    precision: (data.precision || 2).toString(),
  });

  const response = await fetch(
    `${process.env.COINGECKO_API_URL}/coins/markets?${params.toString()}`,
    {
      method: "GET",
      next: { revalidate: ttl },
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
