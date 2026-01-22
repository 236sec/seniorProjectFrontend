import { AlertCondition } from "@/constants/enum/AlertCondition";

export interface GetNotificationsParams {
  userId: string;
}

export interface NotificationToken {
  _id: string;
  name: string;
  symbol: string;
  id: string;
  image?: {
    thumb: string;
    small: string;
    large: string;
    _id?: string;
  };
}

export interface NotificationItem {
  _id: string;
  user: string;
  token: NotificationToken;
  targetPrice: number;
  condition: AlertCondition;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GetNotificationsResponse = NotificationItem[];
