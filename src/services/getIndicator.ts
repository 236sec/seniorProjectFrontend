"use server";

import {
  GetIndicatorRequest,
  GetIndicatorResponse,
} from "@/constants/types/api/getIndicatorTypes";
import { env } from "@/env";

export async function getIndicator(
  data: GetIndicatorRequest
): Promise<GetIndicatorResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const queryParams = new URLSearchParams({
      indicatorType: data.query.indicatorType,
    });

    const response = await fetch(
      `${backendUrl}/indicators/${
        data.params.coinId
      }?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const responseData = (await response.json()) as GetIndicatorResponse;
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
