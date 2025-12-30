"use server";

import type {
  GetHistoricalPricesParams,
  GetHistoricalPricesResponse,
} from "@/constants/types/api/tokens/getHistoricalPricesTypes";
import { env } from "@/env";

export async function getHistoricalPrices({
  id,
  days,
}: GetHistoricalPricesParams): Promise<GetHistoricalPricesResponse | null> {
  try {
    const response = await fetch(
      `${env.BACKEND_URL}/tokens/${id}/historical-prices?days=${days}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch historical prices: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data: GetHistoricalPricesResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    return null;
  }
}
