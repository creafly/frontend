"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/providers/auth-provider";
import { notificationsApi } from "@/lib/api/notifications";

const WS_BASE_URL = process.env.NEXT_PUBLIC_NOTIFICATIONS_WS_URL;
const NOTIFICATIONS_STORAGE_KEY = "creafly_notifications";

export interface Notification {
	id: string;
	userId: string;
	tenantId?: string;
	type: string;
	title: string;
	message: string;
	data?: string;
	status: "unread" | "read" | "archived";
	readAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Invitation {
	id: string;
	tenantId: string;
	tenantName: string;
	inviterId: string;
	inviterName: string;
	inviteeId: string;
	email: string;
	status: "pending" | "accepted" | "rejected" | "expired";
	expiresAt: string;
	createdAt: string;
}

export interface PushNotificationMessage {
	id: string;
	pushNotificationId: string;
	title: string;
	message: string;
	buttons?: { label: string; url: string }[];
	deliveredAt: string;
	readAt?: string;
}

type WebSocketMessage =
	| { type: "notification"; payload: Notification }
	| { type: "invitation"; payload: Invitation }
	| { type: "invitation_update"; payload: Invitation }
	| { type: "push_notification"; payload: PushNotificationMessage }
	| { type: "ping" };

interface UseWebSocketOptions {
	autoConnect?: boolean;
	reconnect?: boolean;
	reconnectDelay?: number;
	maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
	isConnected: boolean;
	isLoading: boolean;
	notifications: Notification[];
	invitations: Invitation[];
	pushNotifications: PushNotificationMessage[];
	connect: () => void;
	disconnect: () => void;
	clearNotifications: () => void;
	markAsRead: (id: string) => void;
	dismissPushNotification: (id: string) => void;
}

function loadNotificationsFromStorage(): Notification[] {
	if (typeof window === "undefined") return [];
	try {
		const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (error) {
		console.warn("Failed to load notifications from storage:", error);
	}
	return [];
}

function saveNotificationsToStorage(notifications: Notification[]) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
	} catch (error) {
		console.warn("Failed to save notifications to storage:", error);
	}
}

export function useNotificationsWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
	const {
		autoConnect = true,
		reconnect = true,
		reconnectDelay = 3000,
		maxReconnectAttempts = 5,
	} = options;

	const { tokens, isAuthenticated, user } = useAuth();
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectAttemptsRef = useRef(0);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const connectRef = useRef<(() => void) | undefined>(undefined);
	const initialFetchDoneRef = useRef(false);
	const lastUserIdRef = useRef<string | null>(null);

	const [isConnected, setIsConnected] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [notifications, setNotifications] = useState<Notification[]>(() =>
		loadNotificationsFromStorage()
	);
	const [invitations, setInvitations] = useState<Invitation[]>([]);
	const [pushNotifications, setPushNotifications] = useState<PushNotificationMessage[]>([]);

	useEffect(() => {
		saveNotificationsToStorage(notifications);
	}, [notifications]);

	useEffect(() => {
		if (user?.id && lastUserIdRef.current !== user.id) {
			if (lastUserIdRef.current !== null) {
				setNotifications([]);
				setInvitations([]);
				localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
			}
			lastUserIdRef.current = user.id;
			initialFetchDoneRef.current = false;
		}
	}, [user?.id]);

	const fetchInitialNotifications = useCallback(async () => {
		if (!tokens?.accessToken || initialFetchDoneRef.current) return;

		try {
			setIsLoading(true);

			let fetchedNotifications: Notification[] = [];
			let fetchedInvitations: Invitation[] = [];

			try {
				fetchedNotifications =
					(await notificationsApi.getUnreadNotifications(tokens.accessToken)) || [];
			} catch (error) {
				console.warn("Failed to fetch notifications:", error);
			}

			try {
				const invitations = (await notificationsApi.getInvitations(tokens.accessToken)) || [];
				fetchedInvitations = invitations.filter((i) => i.status === "pending");
			} catch (error) {
				console.warn("Failed to fetch invitations:", error);
			}

			setNotifications((prev) => {
				const mergedNotifications = fetchedNotifications.map((fetched) => {
					const existing = prev.find((p) => p.id === fetched.id);
					if (existing && existing.status === "read" && fetched.status === "unread") {
						return existing;
					}
					return fetched;
				});
				const localOnly = prev.filter((p) => !fetchedNotifications.some((f) => f.id === p.id));
				return [...mergedNotifications, ...localOnly].sort(
					(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			});
			setInvitations(fetchedInvitations);
			initialFetchDoneRef.current = true;
		} catch (error) {
			console.error("Failed to fetch initial notifications:", error);
		} finally {
			setIsLoading(false);
		}
	}, [tokens?.accessToken]);

	const clearNotifications = useCallback(() => {
		setNotifications([]);
		localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
	}, []);

	const markAsRead = useCallback((id: string) => {
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, status: "read" as const } : n))
		);
	}, []);

	const dismissPushNotification = useCallback((id: string) => {
		setPushNotifications((prev) => prev.filter((p) => p.id !== id));
	}, []);

	const handleMessage = useCallback((event: MessageEvent) => {
		try {
			const message = JSON.parse(event.data) as WebSocketMessage;

			switch (message.type) {
				case "notification":
					setNotifications((prev) => {
						const exists = prev.some((n) => n.id === message.payload.id);
						if (exists) return prev;
						return [message.payload, ...prev];
					});
					if (message.payload.type === "push") {
						const notification = message.payload;
						let buttons: { label: string; url: string }[] | undefined;

						if (notification.data) {
							try {
								const dataObj =
									typeof notification.data === "string"
										? JSON.parse(notification.data)
										: notification.data;
								if (dataObj.buttons && Array.isArray(dataObj.buttons)) {
									buttons = dataObj.buttons;
								}
							} catch {}
						}

						const pushMessage: PushNotificationMessage = {
							id: notification.id,
							pushNotificationId: notification.id,
							title: notification.title,
							message: notification.message,
							buttons,
							deliveredAt: notification.createdAt,
						};

						setPushNotifications((prev) => {
							const exists = prev.some((p) => p.id === pushMessage.id);
							if (exists) return prev;
							return [pushMessage, ...prev];
						});
					}
					break;
				case "invitation":
					setInvitations((prev) => {
						const exists = prev.some((i) => i.id === message.payload.id);
						if (exists) return prev;
						return [message.payload, ...prev];
					});
					break;
				case "invitation_update":
					setInvitations((prev) =>
						prev.map((i) => (i.id === message.payload.id ? message.payload : i))
					);
					break;
				case "push_notification":
					setPushNotifications((prev) => {
						const exists = prev.some((p) => p.id === message.payload.id);
						if (exists) return prev;
						return [message.payload, ...prev];
					});
					break;
				case "ping":
					wsRef.current?.send(JSON.stringify({ type: "pong" }));
					break;
			}
		} catch (error) {
			console.error("Failed to parse WebSocket message:", error);
		}
	}, []);

	const accessToken = tokens?.accessToken;

	const connect = useCallback(() => {
		if (!accessToken || !WS_BASE_URL) {
			console.warn("Cannot connect: missing token or WS URL");
			return;
		}

		if (wsRef.current?.readyState === WebSocket.OPEN) {
			console.log("WebSocket already connected");
			return;
		}

		if (wsRef.current) {
			wsRef.current.close();
		}

		const wsUrl = `${WS_BASE_URL}/api/v1/ws?token=${encodeURIComponent(accessToken)}`;
		const ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log("WebSocket connected");
			setIsConnected(true);
			reconnectAttemptsRef.current = 0;
		};

		ws.onmessage = handleMessage;

		ws.onclose = (event) => {
			console.log("WebSocket disconnected:", event.code, event.reason);
			setIsConnected(false);
			wsRef.current = null;

			if (reconnect && isAuthenticated && reconnectAttemptsRef.current < maxReconnectAttempts) {
				reconnectAttemptsRef.current += 1;
				console.log(
					`Reconnecting in ${reconnectDelay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
				);
				reconnectTimeoutRef.current = setTimeout(() => {
					connectRef.current?.();
				}, reconnectDelay);
			}
		};

		ws.onerror = () => {
			console.warn("WebSocket connection error occurred");
		};

		wsRef.current = ws;
	}, [
		accessToken,
		handleMessage,
		reconnect,
		reconnectDelay,
		maxReconnectAttempts,
		isAuthenticated,
	]);

	useEffect(() => {
		connectRef.current = connect;
	}, [connect]);

	const disconnect = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
			reconnectTimeoutRef.current = null;
		}

		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		setIsConnected(false);
	}, []);

	useEffect(() => {
		if (autoConnect && isAuthenticated && accessToken) {
			fetchInitialNotifications();
			connect();
		}

		return () => {
			disconnect();
		};
	}, [autoConnect, isAuthenticated, accessToken, connect, disconnect, fetchInitialNotifications]);

	return {
		isConnected,
		isLoading,
		notifications,
		invitations,
		pushNotifications,
		connect,
		disconnect,
		clearNotifications,
		markAsRead,
		dismissPushNotification,
	};
}
