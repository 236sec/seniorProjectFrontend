import { auth } from "@/auth";
import { deleteNotification } from "@/services/notifications/deleteNotification";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  ctx: RouteContext<"/api/notifications/[id]">,
) {
  try {
    const session = await auth();
    if (!session?.user?._id) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 },
      );
    }

    const { id } = await ctx.params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const result = await deleteNotification({ id });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to delete notification" },
        { status: 500 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in DELETE /api/notifications/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
