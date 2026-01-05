import { getTrending } from "@/services/gecko/getTrending";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getTrending();
    return NextResponse.json(data.coins);
  } catch (error) {
    console.error("Error fetching trending data:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending data" },
      { status: 500 }
    );
  }
}
