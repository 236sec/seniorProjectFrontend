"use server";
import {
  GetHistoricalChartData,
  GetHistoricalChartParams,
} from "@/constants/types/api/gecko/getHistoricalChartTypes";
import { env } from "@/env";

export async function getHistoricalChart(
  data: GetHistoricalChartParams
): Promise<GetHistoricalChartData | undefined> {
  const params = new URLSearchParams({
    vs_currency: data.vs_currency || "usd",
    days: data.days?.toString() || "30",
    interval: data.interval || "",
    precision: data.precision || "2",
  });

  const coingeckoApiUrl = env.COINGECKO_API_URL;
  const response = await fetch(
    `${coingeckoApiUrl}/coins/${data.id}/market_chart?${params.toString()}`,
    {
      method: "GET",
    }
  );
  // For debugging cache hit or miss
  // const dateHeader = response.headers.get("date");
  // console.log("[Fetched at]", dateHeader);
  if (response.ok) {
    const data: GetHistoricalChartData = await response.json();
    return data;
  }
}
