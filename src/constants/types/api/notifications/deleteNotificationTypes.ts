import { AlertCondition } from "@/constants/enum/AlertCondition";

export interface DeleteNotificationParams {
  id: string;
}

export interface DeleteNotificationResponse {
  _id: string;
  user: string;
  token: string;
  targetPrice: number;
  condition: AlertCondition;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
