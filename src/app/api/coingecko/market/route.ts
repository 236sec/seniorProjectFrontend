import { getMarket } from "@/services/gecko/getMarket";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  per_page: z.number().min(1).max(250),
  page: z.number().min(1),
  vs_currency: z.string(),
  include_tokens: z.string(),
  precision: z.number().min(1).max(18),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const per_page = searchParams.get("per_page") || "10";
  const page = searchParams.get("page") || "1";
  const vs_currency = searchParams.get("vs_currency") || "usd";
  const include_tokens = searchParams.get("include_tokens") || "top";
  const precision = searchParams.get("precision") || "2";
  const parsed = requestSchema.safeParse({
    per_page: Number(per_page),
    page: Number(page),
    vs_currency,
    include_tokens,
    precision: Number(precision),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request parameters", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const res = await getMarket(parsed.data, 10);
  if (!res) {
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }

  return NextResponse.json(res);
}
