import { auth } from "@/auth";
import { CreateNotificationDialog } from "@/components/notifications/create-notification-dialog";
import { NotificationList } from "@/components/notifications/notification-list";
import { getNotifications } from "@/services/notifications/getNotifications";

export default async function NotificationsPage() {
  const session = await auth();

  const notifications = await getNotifications({ userId: session!.user._id });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your price alerts and notifications.
          </p>
        </div>
        <CreateNotificationDialog />
      </div>

      <NotificationList notifications={notifications || []} />
    </div>
  );
}
