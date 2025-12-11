import { getHistoricalChart } from "@/services/gecko/getHistoricalChart";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  id: z.string(),
  vs_currency: z.string(),
  days: z.number().min(1),
  interval: z.enum(["daily"]),
  precision: z.string(),
});

async function getData(
  params: Parameters<typeof getHistoricalChart>[0],
  ttl: number
) {
  return await getHistoricalChart(params, ttl);
}

export async function GET(
  req: Request,
  ctx: RouteContext<"/api/coingecko/coins/[id]/chart">
) {
  const { id } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const vs_currency = searchParams.get("vs_currency") || "usd";
  const days = searchParams.get("days") || "30";
  const interval = searchParams.get("interval") || "daily";
  const precision = searchParams.get("precision") || "2";
  const parsed = requestSchema.safeParse({
    id,
    vs_currency,
    days: Number(days),
    interval,
    precision,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request parameters", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const res = await getData(parsed.data, 300);
  if (!res) {
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }

  return NextResponse.json(res);
}
