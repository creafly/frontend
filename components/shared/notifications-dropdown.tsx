"use client";

import { useState } from "react";
import { formatDistanceToNow, type Locale } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import {
	IconBell,
	IconCheck,
	IconCheckbox,
	IconLoader2,
	IconMail,
	IconMailOpened,
	IconTrash,
	IconX,
} from "@tabler/icons-react";

import { useTranslations, useLocale } from "@/providers/i18n-provider";
import { useNotificationsWebSocket, type Notification } from "@/hooks/use-notifications";
import {
	useMarkNotificationAsRead,
	useMarkAllNotificationsAsRead,
	useAcceptInvitation,
	useRejectInvitation,
} from "@/hooks/use-api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const notificationIcons: Record<string, React.ReactNode> = {
	invitation: <IconMail className="h-4 w-4" />,
	invitation_accepted: <IconCheckbox className="h-4 w-4 text-green-500" />,
	invitation_rejected: <IconX className="h-4 w-4 text-red-500" />,
	system: <IconBell className="h-4 w-4" />,
};

function interpolate(template: string, variables: Record<string, string>): string {
	return template.replace(/\{(\w+)\}/g, (_, key) => variables[key] || `{${key}}`);
}

type NotificationTypeKey =
	| "invitation"
	| "invitation_accepted"
	| "invitation_rejected"
	| "member_added"
	| "member_removed"
	| "subscription_created"
	| "subscription_canceled"
	| "trial_ending"
	| "payment_failed";

export function NotificationsDropdown() {
	const t = useTranslations();
	const locale = useLocale();
	const [isOpen, setIsOpen] = useState(false);

	const { notifications, isConnected, isLoading, markAsRead, clearNotifications } =
		useNotificationsWebSocket();

	const markNotificationAsReadMutation = useMarkNotificationAsRead();
	const markAllNotificationsAsReadMutation = useMarkAllNotificationsAsRead();
	const acceptInvitationMutation = useAcceptInvitation();
	const rejectInvitationMutation = useRejectInvitation();

	const unreadCount = notifications.filter((n) => n.status === "unread").length;
	const dateLocale = locale === "ru" ? ru : enUS;

	const handleMarkAsRead = (id: string) => {
		markAsRead(id);
		markNotificationAsReadMutation.mutate(id);
	};

	const handleMarkAllAsRead = () => {
		notifications.forEach((n) => {
			if (n.status === "unread") {
				markAsRead(n.id);
			}
		});
		markAllNotificationsAsReadMutation.mutate();
	};

	const handleAcceptInvitation = (notificationId: string, invitationId: string) => {
		acceptInvitationMutation.mutate(invitationId, {
			onSuccess: () => {
				handleMarkAsRead(notificationId);
			},
		});
	};

	const handleRejectInvitation = (notificationId: string, invitationId: string) => {
		rejectInvitationMutation.mutate(invitationId, {
			onSuccess: () => {
				handleMarkAsRead(notificationId);
			},
		});
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<IconBell className="h-5 w-5" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
						>
							{unreadCount > 99 ? "99+" : unreadCount}
						</Badge>
					)}
					{!isConnected && (
						<span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-yellow-500 ring-2 ring-background" />
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-0" align="end">
				<div className="flex items-center justify-between p-4 pb-2">
					<div className="flex items-center gap-2">
						<h4 className="font-semibold">{t.notifications?.title || "Notifications"}</h4>
						{unreadCount > 0 && (
							<Badge variant="secondary" className="h-5 px-1.5 text-xs">
								{unreadCount}
							</Badge>
						)}
					</div>
					{notifications.length > 0 && (
						<Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleMarkAllAsRead}>
							<IconCheck className="mr-1 h-3 w-3" />
							{t.notifications?.markAllRead || "Mark all read"}
						</Button>
					)}
				</div>
				<Separator />
				<ScrollArea className="h-75">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<IconLoader2 className="h-6 w-6 text-muted-foreground/50 animate-spin mb-2" />
							<p className="text-sm text-muted-foreground">{t.common?.loading || "Loading..."}</p>
						</div>
					) : notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<IconMailOpened className="h-10 w-10 text-muted-foreground/50 mb-2" />
							<p className="text-sm text-muted-foreground">
								{t.notifications?.empty || "No notifications"}
							</p>
						</div>
					) : (
						<AnimatePresence>
							<div className="divide-y">
								{notifications.map((notification) => (
									<NotificationItem
										key={notification.id}
										notification={notification}
										dateLocale={dateLocale}
										onMarkAsRead={() => handleMarkAsRead(notification.id)}
										onAccept={handleAcceptInvitation}
										onReject={handleRejectInvitation}
										isAccepting={acceptInvitationMutation.isPending}
										isRejecting={rejectInvitationMutation.isPending}
									/>
								))}
							</div>
						</AnimatePresence>
					)}
				</ScrollArea>
				{notifications.length > 0 && (
					<>
						<Separator />
						<div className="p-2">
							<Button
								variant="ghost"
								size="sm"
								className="w-full text-xs text-muted-foreground"
								onClick={clearNotifications}
							>
								<IconTrash className="mr-1 h-3 w-3" />
								{t.notifications?.clearAll || "Clear all"}
							</Button>
						</div>
					</>
				)}
			</PopoverContent>
		</Popover>
	);
}

function NotificationItem({
	notification,
	dateLocale,
	onMarkAsRead,
	onAccept,
	onReject,
	isAccepting,
	isRejecting,
}: {
	notification: Notification;
	dateLocale: Locale;
	onMarkAsRead: () => void;
	onAccept: (notificationId: string, invitationId: string) => void;
	onReject: (notificationId: string, invitationId: string) => void;
	isAccepting: boolean;
	isRejecting: boolean;
}) {
	const t = useTranslations();
	const icon = notificationIcons[notification.type] || notificationIcons.system;
	const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
		addSuffix: true,
		locale: dateLocale,
	});

	const notificationData = notification.data ? JSON.parse(notification.data) : null;
	const invitationId = notificationData?.invitationId;
	const isInvitation = notification.type === "invitation" && invitationId;

	const typeKey = notification.type as NotificationTypeKey;
	const typeTranslations = t.notifications?.types?.[typeKey];

	let displayTitle = notification.title;
	let displayMessage = notification.message;

	if (typeTranslations && notificationData) {
		displayTitle = interpolate(typeTranslations.title, notificationData);
		displayMessage = interpolate(typeTranslations.message, notificationData);
	} else if (typeTranslations) {
		displayTitle = typeTranslations.title;
		displayMessage = typeTranslations.message;
	}

	const handleClick = () => {
		if (!isInvitation) {
			onMarkAsRead();
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -100 }}
			className={cn(
				"flex gap-3 p-4 hover:bg-muted/50 transition-colors",
				notification.status === "unread" && "bg-primary/5",
				!isInvitation && "cursor-pointer"
			)}
			onClick={handleClick}
		>
			<div
				className={cn(
					"flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
					notification.status !== "unread" ? "bg-muted" : "bg-primary/10"
				)}
			>
				{icon}
			</div>
			<div className="flex-1 min-w-0">
				<p className={cn("text-sm truncate", notification.status === "unread" && "font-medium")}>
					{displayTitle}
				</p>
				<p className="text-xs text-muted-foreground line-clamp-2">{displayMessage}</p>
				<p className="text-xs text-muted-foreground/70 mt-1">{timeAgo}</p>

				{isInvitation && notification.status === "unread" && (
					<div className="flex gap-2 mt-2">
						<Button
							size="sm"
							variant="default"
							className="h-7 text-xs"
							onClick={(e) => {
								e.stopPropagation();
								onAccept(notification.id, invitationId);
							}}
							disabled={isAccepting || isRejecting}
						>
							<IconCheck className="h-3 w-3 mr-1" />
							{t.notifications?.accept || "Accept"}
						</Button>
						<Button
							size="sm"
							variant="outline"
							className="h-7 text-xs"
							onClick={(e) => {
								e.stopPropagation();
								onReject(notification.id, invitationId);
							}}
							disabled={isAccepting || isRejecting}
						>
							<IconX className="h-3 w-3 mr-1" />
							{t.notifications?.reject || "Reject"}
						</Button>
					</div>
				)}
			</div>
			{notification.status === "unread" && !isInvitation && (
				<div className="shrink-0 self-start">
					<span className="h-2 w-2 rounded-full bg-primary block" />
				</div>
			)}
		</motion.div>
	);
}
