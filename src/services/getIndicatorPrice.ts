"use server";

import {
  GetIndicatorPriceRequest,
  GetIndicatorPriceResponse,
} from "@/constants/types/getIndicatorPriceTypes";
import { env } from "@/env";

export async function getIndicatorPrice(
  data: GetIndicatorPriceRequest
): Promise<GetIndicatorPriceResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(
      `${backendUrl}/indicators/${data.params.coinId}/prices`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const responseData = (await response.json()) as GetIndicatorPriceResponse;
      return responseData;
    } else {
      console.error(
        `Get RSI indicator failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Get RSI indicator fetch failed:", error);
    return undefined;
  }
}
