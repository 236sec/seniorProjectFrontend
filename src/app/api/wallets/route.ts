import { auth } from "@/auth";
import { createWallet } from "@/services/createWallet";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  name: z.string().min(1, "Wallet name is required"),
  description: z.string().optional(),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const session = await auth();

    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request parameters", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = await createWallet({
      params: {
        userId: session.user._id,
      },
      body: parsed.data,
    });

    if (!data) {
      return NextResponse.json(
        { error: "Failed to create wallet" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/wallets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
