import { IndicatorType } from "@/constants/enum/IndicatorType";
import { getIndicator } from "@/services/getIndicator";

async function getData(params: Parameters<typeof getIndicator>[0]) {
  return await getIndicator(params);
}

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/indicators/[id]">
): Promise<Response> {
  try {
    const { id: coinId } = await ctx.params;
    const query = Object.fromEntries(
      new URL(request.url).searchParams.entries()
    );

    const data = await getData({
      params: { coinId },
      query: {
        indicatorType: (query.indicatorType as IndicatorType) || "rsi",
      },
    });

    if (!data) {
      return Response.json(
        { error: "Failed to fetch address balances" },
        { status: 500 }
      );
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/alchemy/balances/[address]:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
