"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon, TypographyMuted, TypographyLabel } from "@/components/typography";
import { IconX, IconExternalLink, IconArrowRight } from "@tabler/icons-react";
import { useNotificationsWebSocket, type PushNotificationMessage } from "@/hooks/use-notifications";
import { useAuth } from "@/providers/auth-provider";
import { notificationsApi } from "@/lib/api/notifications";

export function PushNotificationToastProvider() {
	const { tokens } = useAuth();
	const router = useRouter();
	const { pushNotifications, dismissPushNotification } = useNotificationsWebSocket();
	const shownIds = useRef<Set<string>>(new Set());

	useEffect(() => {
		pushNotifications.forEach((push) => {
			if (!shownIds.current.has(push.id)) {
				shownIds.current.add(push.id);
				showPushToast(push, tokens?.accessToken || "", router, () => {
					dismissPushNotification(push.id);
				});
			}
		});
	}, [pushNotifications, tokens?.accessToken, dismissPushNotification, router]);

	return null;
}

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

function isInternalLink(url: string): boolean {
	return url.startsWith("/") || url.startsWith("#");
}

function showPushToast(
	push: PushNotificationMessage,
	accessToken: string,
	router: AppRouterInstance,
	onDismiss: () => void
) {
	const handleMarkAsRead = async () => {
		try {
			if (accessToken) {
				await notificationsApi.markPushAsRead(accessToken, push.id);
			}
		} catch (error) {
			console.error("Failed to mark push as read:", error);
		}
		onDismiss();
	};

	const handleButtonClick = (url: string, toastId: string | number) => {
		if (isInternalLink(url)) {
			router.push(url);
		} else {
			window.open(url, "_blank");
		}
		handleMarkAsRead();
		toast.dismiss(toastId);
	};

	toast.custom(
		(t) => (
			<div className="w-full max-w-sm bg-background border rounded-lg shadow-lg p-4">
				<div className="flex items-start gap-3">
					<div className="flex-1 min-w-0">
						<TypographyLabel className="font-semibold">{push.title}</TypographyLabel>
						<TypographyMuted className="mt-1">{push.message}</TypographyMuted>
						{push.buttons && push.buttons.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-3">
								{push.buttons.map((btn, i) => (
									<Button
										key={i}
										size="sm"
										variant="outline"
										className="h-7 text-xs"
										onClick={() => handleButtonClick(btn.url, t)}
									>
										{isInternalLink(btn.url) ? (
											<Icon icon={IconArrowRight} size="xs" className="mr-1" />
										) : (
											<Icon icon={IconExternalLink} size="xs" className="mr-1" />
										)}
										{btn.label}
									</Button>
								))}
							</div>
						)}
					</div>
					<Button
						variant="ghost"
						size="icon-sm"
						className="shrink-0"
						onClick={() => {
							handleMarkAsRead();
							toast.dismiss(t);
						}}
					>
						<Icon icon={IconX} />
					</Button>
				</div>
			</div>
		),
		{
			id: `push-${push.id}`,
			duration: 10000,
			onDismiss: handleMarkAsRead,
		}
	);
}
