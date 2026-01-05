"use server";

import { GetTrendingData } from "@/constants/types/api/gecko/getTrendingTypes";
import { env } from "@/env";

export async function getTrending(): Promise<GetTrendingData> {
  const url = `${env.COINGECKO_API_URL}/search/trending`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": env.COINGECKO_DEMO_API_KEY || "",
    },
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Failed to fetch trending data: ${response.statusText}`);
  }

  return response.json() as Promise<GetTrendingData>;
}
