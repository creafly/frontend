import type { Notification, Invitation } from "@/hooks/use-notifications";
import { createServiceFetch, ApiError, type FetchOptions } from "./fetch-with-retry";

const NOTIFICATIONS_API_URL = process.env.NEXT_PUBLIC_NOTIFICATIONS_URL || "http://localhost:8081";
const serviceFetch = createServiceFetch(NOTIFICATIONS_API_URL);

class NotificationsApiError extends ApiError {
	constructor(status: number, message: string, code?: string) {
		super(status, message, code);
		this.name = "NotificationsApiError";
	}
}

async function fetchNotificationsApi<T>(
	endpoint: string,
	accessToken: string,
	options?: FetchOptions
): Promise<T> {
	try {
		return await serviceFetch<T>(endpoint, {
			...options,
			accessToken,
		});
	} catch (error) {
		if (error instanceof ApiError) {
			throw new NotificationsApiError(error.status, error.message, error.code);
		}
		throw error;
	}
}

export interface UnreadCountResponse {
	count: number;
}

export type PushTargetType = "all" | "tenant" | "users";
export type PushStatus = "draft" | "scheduled" | "sent" | "cancelled";

export interface PushButton {
	label: string;
	url: string;
}

export interface PushNotification {
	id: string;
	title: string;
	message: string;
	targetType: PushTargetType;
	targetTenantId?: string;
	targetUserIds?: string[];
	buttons?: PushButton[];
	scheduledAt?: string;
	sentAt?: string;
	status: PushStatus;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface PushNotificationRecipient {
	id: string;
	pushNotificationId: string;
	userId: string;
	deliveredAt?: string;
	readAt?: string;
	createdAt: string;
}

export interface CreatePushNotificationRequest {
	title: string;
	message: string;
	targetType: PushTargetType;
	targetTenantId?: string;
	targetUserIds?: string[];
	buttons?: PushButton[];
	scheduledAt?: string;
}

export interface UpdatePushNotificationRequest {
	title?: string;
	message?: string;
	targetType?: PushTargetType;
	targetTenantId?: string;
	targetUserIds?: string[];
	buttons?: PushButton[];
	scheduledAt?: string;
}

export interface PushNotificationsListResponse {
	data: PushNotification[];
	total: number;
	offset: number;
	limit: number;
}

export interface UserPushNotification {
	id: string;
	pushNotificationId: string;
	title: string;
	message: string;
	buttons?: PushButton[];
	deliveredAt: string;
	readAt?: string;
}

export const notificationsApi = {
	getNotifications: async (accessToken: string) => {
		return fetchNotificationsApi<Notification[]>("/api/v1/notifications", accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	getUnreadNotifications: async (accessToken: string) => {
		return fetchNotificationsApi<Notification[]>("/api/v1/notifications/unread", accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	getUnreadCount: async (accessToken: string) => {
		return fetchNotificationsApi<UnreadCountResponse>(
			"/api/v1/notifications/unread/count",
			accessToken,
			{ method: "GET", skipContentType: true }
		);
	},

	markAsRead: async (accessToken: string, id: string) => {
		return fetchNotificationsApi<{ message: string }>(
			`/api/v1/notifications/${id}/read`,
			accessToken,
			{ method: "PUT", skipContentType: true }
		);
	},

	markAllAsRead: async (accessToken: string) => {
		return fetchNotificationsApi<{ message: string }>(
			"/api/v1/notifications/read-all",
			accessToken,
			{ method: "PUT", skipContentType: true }
		);
	},

	deleteNotification: async (accessToken: string, id: string) => {
		return fetchNotificationsApi<{ message: string }>(`/api/v1/notifications/${id}`, accessToken, {
			method: "DELETE",
			skipContentType: true,
		});
	},

	getInvitations: async (accessToken: string) => {
		return fetchNotificationsApi<Invitation[]>("/api/v1/invitations", accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	acceptInvitation: async (accessToken: string, id: string) => {
		return fetchNotificationsApi<{ message: string }>(
			`/api/v1/invitations/${id}/accept`,
			accessToken,
			{ method: "PUT", skipContentType: true }
		);
	},

	rejectInvitation: async (accessToken: string, id: string) => {
		return fetchNotificationsApi<{ message: string }>(
			`/api/v1/invitations/${id}/reject`,
			accessToken,
			{ method: "PUT", skipContentType: true }
		);
	},

	getTenantInvitations: async (accessToken: string, tenantId: string) => {
		return fetchNotificationsApi<Invitation[]>(
			`/api/v1/tenants/${tenantId}/invitations`,
			accessToken,
			{ method: "GET", skipContentType: true }
		);
	},

	getMyPushNotifications: async (accessToken: string) => {
		return fetchNotificationsApi<UserPushNotification[]>("/api/v1/push", accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	markPushAsRead: async (accessToken: string, id: string) => {
		return fetchNotificationsApi<{ message: string }>(`/api/v1/push/${id}/read`, accessToken, {
			method: "PUT",
			skipContentType: true,
		});
	},

	getPushNotifications: async (accessToken: string, offset = 0, limit = 20) => {
		return fetchNotificationsApi<PushNotificationsListResponse>(
			`/api/v1/admin/push?offset=${offset}&limit=${limit}`,
			accessToken,
			{ method: "GET", skipContentType: true }
		);
	},

	getPushNotification: async (accessToken: string, id: string) => {
		return fetchNotificationsApi<PushNotification>(`/api/v1/admin/push/${id}`, accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	createPushNotification: async (accessToken: string, data: CreatePushNotificationRequest) => {
		return fetchNotificationsApi<PushNotification>("/api/v1/admin/push", accessToken, {
			method: "POST",
			body: JSON.stringify(data),
		});
	},

	updatePushNotification: async (
		accessToken: string,
		id: string,
		data: UpdatePushNotificationRequest
	) => {
		return fetchNotificationsApi<PushNotification>(`/api/v1/admin/push/${id}`, accessToken, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	},

	deletePushNotification: async (accessToken: string, id: string) => {
		return fetchNotificationsApi<{ message: string }>(`/api/v1/admin/push/${id}`, accessToken, {
			method: "DELETE",
			skipContentType: true,
		});
	},

	sendPushNotification: async (accessToken: string, id: string) => {
		return fetchNotificationsApi<{ message: string }>(
			`/api/v1/admin/push/${id}/send`,
			accessToken,
			{
				method: "POST",
				skipContentType: true,
			}
		);
	},

	cancelPushNotification: async (accessToken: string, id: string) => {
		return fetchNotificationsApi<{ message: string }>(
			`/api/v1/admin/push/${id}/cancel`,
			accessToken,
			{ method: "POST", skipContentType: true }
		);
	},
};

export { NotificationsApiError };
