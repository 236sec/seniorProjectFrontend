"use server";

import type {
  GetTokensParams,
  GetTokensResponse,
} from "@/constants/types/api/getTokensTypes";
import { env } from "@/env";

export async function getTokens(
  params: GetTokensParams = {},
  ttl: number
): Promise<GetTokensResponse | null> {
  const { page = 1, limit = 10, search = "" } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    queryParams.set("search", search);
  }

  try {
    const response = await fetch(
      `${env.BACKEND_URL}/tokens?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: ttl },
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch tokens: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data: GetTokensResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return null;
  }
}
