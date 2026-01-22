"use server";

import {
  GetNotificationsParams,
  GetNotificationsResponse,
} from "@/constants/types/api/notifications/getNotificationsTypes";
import { env } from "@/env";

export async function getNotifications(
  data: GetNotificationsParams,
): Promise<GetNotificationsResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(
      `${backendUrl}/notifications/user/${data.userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      const responseData = (await response.json()) as GetNotificationsResponse;
      return responseData;
    } else {
      console.error(
        `Get notifications failed with status: ${response.status} ${response.statusText}`,
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Get notifications fetch failed:", error);
    return undefined;
  }
}
