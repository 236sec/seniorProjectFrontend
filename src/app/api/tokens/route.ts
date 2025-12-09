import type { GetTokensParams } from "@/constants/types/api/getTokensTypes";
import { getTokens } from "@/services/getTokens";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams;

  const params: GetTokensParams = {
    page: searchParams.get("page")
      ? parseInt(searchParams.get("page")!)
      : undefined,
    limit: searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined,
    search: searchParams.get("search") || undefined,
  };

  // Validate parameters
  if (params.page && params.page < 1) {
    return Response.json(
      { error: "Page must be greater than or equal to 1" },
      { status: 400 }
    );
  }

  if (params.limit && params.limit < 1) {
    return Response.json(
      { error: "Limit must be greater than or equal to 1" },
      { status: 400 }
    );
  }

  const data = await getTokens(params);

  return data
    ? Response.json(data, { status: 200 })
    : Response.json({ error: "Failed to fetch tokens" }, { status: 500 });
}
