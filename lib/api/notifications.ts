import type { Notification, Invitation } from "@/hooks/use-notifications";

const NOTIFICATIONS_API_URL = process.env.NEXT_PUBLIC_NOTIFICATIONS_URL || "http://localhost:8081";

class NotificationsApiError extends Error {
	constructor(public status: number, message: string) {
		super(message);
		this.name = "NotificationsApiError";
	}
}

async function fetchNotificationsApi<T>(
	endpoint: string,
	accessToken: string,
	options?: RequestInit & { skipContentType?: boolean }
): Promise<T> {
	const url = `${NOTIFICATIONS_API_URL}${endpoint}`;
	const { skipContentType, ...fetchOptions } = options || {};

	const headers: HeadersInit = {
		Authorization: `Bearer ${accessToken}`,
		...fetchOptions?.headers,
	};

	if (!skipContentType && fetchOptions?.body) {
		(headers as Record<string, string>)["Content-Type"] = "application/json";
	}

	const response = await fetch(url, {
		...fetchOptions,
		headers,
	});

	let data: T | { error?: string };
	try {
		data = await response.json();
	} catch {
		throw new NotificationsApiError(response.status, "Failed to parse response");
	}

	if (!response.ok) {
		throw new NotificationsApiError(
			response.status,
			(data as { error?: string }).error || "An error occurred"
		);
	}

	return data as T;
}

export interface UnreadCountResponse {
	count: number;
}

export const notificationsApi = {
	getNotifications: async (accessToken: string) => {
		return fetchNotificationsApi<Notification[]>("/api/v1/notifications", accessToken, {
			method: "GET",
			skipContentType: true,
		});
	},

	getUnreadNotifications: async (accessToken: string) => {
		return fetchNotificationsApi<Notification[]>(
			"/api/v1/notifications/unread",
			accessToken,
			{ method: "GET", skipContentType: true }
		);
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
};

export { NotificationsApiError };
