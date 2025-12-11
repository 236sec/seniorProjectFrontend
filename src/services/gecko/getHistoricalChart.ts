"use server";
import {
  GetHistoricalChartData,
  GetHistoricalChartParams,
} from "@/constants/types/api/gecko/getHistoricalChartTypes";
import { env } from "@/env";

export async function getHistoricalChart(
  data: GetHistoricalChartParams,
  ttl: number
): Promise<GetHistoricalChartData | undefined> {
  try {
    const params = new URLSearchParams({
      vs_currency: data.vs_currency || "usd",
      days: data.days?.toString() || "30",
      interval: data.interval || "",
      precision: data.precision || "2",
    });

    const coingeckoApiUrl = env.COINGECKO_API_URL;
    const url = `${coingeckoApiUrl}/coins/${
      data.id
    }/market_chart?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      next: { revalidate: ttl },
    });
    // For debugging cache hit or miss
    // const dateHeader = response.headers.get("date");
    // console.log("[Fetched at]", dateHeader);
    if (response.ok) {
      const data: GetHistoricalChartData = await response.json();
      return data;
    } else {
      console.error(
        `Get historical chart failed with status: ${response.status} ${response.statusText} - URL: ${url}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Get historical chart fetch failed:", error);
    return undefined;
  }
}
