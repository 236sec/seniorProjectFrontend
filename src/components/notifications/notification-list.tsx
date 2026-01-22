"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCondition } from "@/constants/enum/AlertCondition";
import {
  NotificationItem,
  NotificationToken,
} from "@/constants/types/api/notifications/getNotificationsTypes";
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { BellIcon, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NotificationListProps {
  notifications: NotificationItem[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter();
  const [notificationToDelete, setNotificationToDelete] = useState<
    string | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = (id: string) => {
    setNotificationToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/notifications/${notificationToDelete}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        router.refresh();
      } else {
        console.error("Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    } finally {
      setIsDeleting(false);
      setNotificationToDelete(null);
    }
  };

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
          <BellIcon className="mb-2 h-8 w-8 opacity-50" />
          <p>No notifications found. Create one to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Target Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((notification) => {
              const token =
                typeof notification.token === "object"
                  ? (notification.token as NotificationToken)
                  : null;

              return (
                <TableRow key={notification._id}>
                  <TableCell className="font-medium">
                    {token ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={token.image?.small || ""}
                            alt={token.name}
                          />
                          <AvatarFallback>
                            {token.symbol.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{token.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({token.symbol.toUpperCase()})
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Unknown Token
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {notification.condition === AlertCondition.ABOVE ? (
                        <Badge
                          variant="default"
                          className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0"
                        >
                          <TrendingUp className="mr-1 h-3 w-3" />
                          Above
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0"
                        >
                          <TrendingDown className="mr-1 h-3 w-3" />
                          Below
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(notification.targetPrice)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={notification.isActive ? "outline" : "secondary"}
                      className={cn(
                        notification.isActive
                          ? "border-green-500 text-green-500"
                          : "text-muted-foreground",
                      )}
                    >
                      {notification.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    suppressHydrationWarning
                    className="text-right text-muted-foreground"
                  >
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(notification._id)}
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      <ConfirmDialog
        open={!!notificationToDelete}
        onOpenChange={(open) => !open && setNotificationToDelete(null)}
        title="Delete Notification"
        description="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </Card>
  );
}
