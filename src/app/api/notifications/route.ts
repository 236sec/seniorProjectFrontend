import { auth } from "@/auth";
import { AlertCondition } from "@/constants/enum/AlertCondition";
import { createNotification } from "@/services/notifications/createNotification";
import { getNotifications } from "@/services/notifications/getNotifications";
import { z } from "zod";

function getNotificationsData(userId: string) {
  return getNotifications({ userId });
}

export async function GET(): Promise<Response> {
  try {
    const session = await auth();
    if (!session?.user?._id) {
      return Response.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 },
      );
    }

    const notifications = await getNotificationsData(session.user._id);

    if (!notifications) {
      return Response.json(
        { error: "Failed to fetch notifications" },
        { status: 500 },
      );
    }

    return Response.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/notifications:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createNotificationSchema = z
  .object({
    tokenId: z.string().optional(),
    coingeckoId: z.string().optional(),
    targetPrice: z.number(),
    condition: z.nativeEnum(AlertCondition),
  })
  .refine((data) => data.tokenId || data.coingeckoId, {
    message: "Either tokenId or coingeckoId must be provided",
  });

export async function POST(request: Request): Promise<Response> {
  try {
    const session = await auth();
    if (!session?.user?._id) {
      return Response.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate body
    const result = createNotificationSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: "Invalid request data", details: result.error },
        { status: 400 },
      );
    }

    const { tokenId, coingeckoId, targetPrice, condition } = result.data;

    const notificationData = await createNotification({
      userId: session.user._id,
      tokenId,
      coingeckoId,
      targetPrice,
      condition,
    });

    if (!notificationData) {
      return Response.json(
        { error: "Failed to create notification" },
        { status: 500 },
      );
    }

    return Response.json(notificationData, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/notifications:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
