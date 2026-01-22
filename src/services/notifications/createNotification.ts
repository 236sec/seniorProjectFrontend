"use server";

import {
  CreateNotificationParams,
  CreateNotificationResponse,
} from "@/constants/types/api/notifications/createNotificationTypes";
import { env } from "@/env";

export async function createNotification(
  data: CreateNotificationParams,
): Promise<CreateNotificationResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(`${backendUrl}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData =
        (await response.json()) as CreateNotificationResponse;
      return responseData;
    } else {
      console.error(
        `Create notification failed with status: ${response.status} ${response.statusText}`,
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Create notification fetch failed:", error);
    return undefined;
  }
}
