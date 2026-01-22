import { AlertCondition } from "@/constants/enum/AlertCondition";
import { NotificationItem } from "./getNotificationsTypes";

export interface CreateNotificationParams {
  userId: string;
  tokenId?: string;
  coingeckoId?: string;
  targetPrice: number;
  condition: AlertCondition;
}

export type CreateNotificationResponse = NotificationItem;
