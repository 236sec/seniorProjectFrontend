"use server";

import {
  DeleteNotificationParams,
  DeleteNotificationResponse,
} from "@/constants/types/api/notifications/deleteNotificationTypes";
import { env } from "@/env";

export async function deleteNotification(
  data: DeleteNotificationParams,
): Promise<DeleteNotificationResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(`${backendUrl}/notifications/${data.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const responseData =
        (await response.json()) as DeleteNotificationResponse;
      return responseData;
    } else {
      console.error(
        `Delete notification failed with status: ${response.status} ${response.statusText}`,
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Delete notification fetch failed:", error);
    return undefined;
  }
}
