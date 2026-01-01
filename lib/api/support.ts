import type {
	Ticket,
	TicketMessage,
	ErrorReport,
	CreateTicketRequest,
	UpdateTicketRequest,
	CreateMessageRequest,
	CreateErrorReportRequest,
	TicketListResponse,
	TicketStats,
	ErrorReportListResponse,
} from "@/types/support";
import { getTenantId } from "@/lib/tenant";

const SUPPORT_API_URL = process.env.NEXT_PUBLIC_SUPPORT_API_URL;

class SupportApiError extends Error {
	constructor(public status: number, message: string, public code?: string) {
		super(message);
		this.name = "SupportApiError";
	}
}

export async function submitErrorReport(
	request: CreateErrorReportRequest,
	accessToken?: string | null
): Promise<ErrorReport> {
	const url = `${SUPPORT_API_URL}/api/v1/error-reports`;
	const tenantId = getTenantId();

	const headers: HeadersInit = {
		"Content-Type": "application/json",
	};

	if (accessToken) {
		(headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
	}

	if (tenantId) {
		(headers as Record<string, string>)["X-Tenant-ID"] = tenantId;
	}

	const response = await fetch(url, {
		method: "POST",
		headers,
		body: JSON.stringify(request),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new SupportApiError(
			response.status,
			data.error || "Failed to submit error report",
			data.code
		);
	}

	return data;
}

async function fetchSupportApiWithAuth<T>(
	endpoint: string,
	accessToken: string | null,
	options?: RequestInit
): Promise<T> {
	const tenantId = getTenantId();

	const url = `${SUPPORT_API_URL}${endpoint}`;

	const headers: HeadersInit = {
		"Content-Type": "application/json",
		...options?.headers,
	};

	if (accessToken) {
		(headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
	}

	if (tenantId) {
		(headers as Record<string, string>)["X-Tenant-ID"] = tenantId;
	}

	const response = await fetch(url, {
		...options,
		headers,
	});

	const data = await response.json();

	if (!response.ok) {
		throw new SupportApiError(response.status, data.error || "An error occurred", data.code);
	}

	return data;
}

export function createSupportApiClient(accessToken: string | null) {
	const authFetch = <T>(endpoint: string, options?: RequestInit) => {
		if (!accessToken) {
			throw new SupportApiError(401, "Not authenticated");
		}
		return fetchSupportApiWithAuth<T>(endpoint, accessToken, options);
	};

	return {
		tickets: {
			getMyTickets: async (params?: { status?: string; page?: number; pageSize?: number }) => {
				const searchParams = new URLSearchParams();
				if (params?.status) searchParams.set("status", params.status);
				if (params?.page) searchParams.set("page", String(params.page));
				if (params?.pageSize) searchParams.set("page_size", String(params.pageSize));

				const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
				return authFetch<TicketListResponse>(`/api/v1/my-tickets${query}`);
			},

			list: async (params?: {
				status?: string;
				priority?: string;
				category?: string;
				page?: number;
				pageSize?: number;
			}) => {
				const searchParams = new URLSearchParams();
				if (params?.status) searchParams.set("status", params.status);
				if (params?.priority) searchParams.set("priority", params.priority);
				if (params?.category) searchParams.set("category", params.category);
				if (params?.page) searchParams.set("page", String(params.page));
				if (params?.pageSize) searchParams.set("page_size", String(params.pageSize));

				const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
				return authFetch<TicketListResponse>(`/api/v1/tickets${query}`);
			},

			get: async (id: string) => {
				return authFetch<Ticket>(`/api/v1/tickets/${id}`);
			},

			create: async (request: CreateTicketRequest) => {
				return authFetch<Ticket>("/api/v1/tickets", {
					method: "POST",
					body: JSON.stringify(request),
				});
			},

			update: async (id: string, request: UpdateTicketRequest) => {
				return authFetch<Ticket>(`/api/v1/tickets/${id}`, {
					method: "PUT",
					body: JSON.stringify(request),
				});
			},

			delete: async (id: string) => {
				return authFetch<{ message: string }>(`/api/v1/tickets/${id}`, {
					method: "DELETE",
				});
			},

			getStats: async () => {
				return authFetch<TicketStats>("/api/v1/tickets/stats");
			},
		},

		messages: {
			list: async (ticketId: string) => {
				return authFetch<TicketMessage[]>(`/api/v1/tickets/${ticketId}/messages`);
			},

			create: async (ticketId: string, request: CreateMessageRequest) => {
				return authFetch<TicketMessage>(`/api/v1/tickets/${ticketId}/messages`, {
					method: "POST",
					body: JSON.stringify(request),
				});
			},
		},

		errorReports: {
			submit: async (request: CreateErrorReportRequest) => {
				return authFetch<ErrorReport>("/api/v1/error-reports", {
					method: "POST",
					body: JSON.stringify(request),
				});
			},
		},

		admin: {
			tickets: {
				list: async (params?: {
					status?: string;
					priority?: string;
					category?: string;
					page?: number;
					pageSize?: number;
				}) => {
					const searchParams = new URLSearchParams();
					if (params?.status) searchParams.set("status", params.status);
					if (params?.priority) searchParams.set("priority", params.priority);
					if (params?.category) searchParams.set("category", params.category);
					if (params?.page) searchParams.set("page", String(params.page));
					if (params?.pageSize) searchParams.set("page_size", String(params.pageSize));

					const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
					return authFetch<TicketListResponse>(`/api/v1/admin/tickets${query}`);
				},

				get: async (id: string) => {
					return authFetch<Ticket>(`/api/v1/admin/tickets/${id}`);
				},

				update: async (id: string, request: UpdateTicketRequest) => {
					return authFetch<Ticket>(`/api/v1/admin/tickets/${id}`, {
						method: "PUT",
						body: JSON.stringify(request),
					});
				},

				getStats: async () => {
					return authFetch<TicketStats>("/api/v1/admin/tickets/stats");
				},
			},

			messages: {
				list: async (ticketId: string) => {
					return authFetch<TicketMessage[]>(`/api/v1/admin/tickets/${ticketId}/messages`);
				},

				create: async (ticketId: string, request: CreateMessageRequest) => {
					return authFetch<TicketMessage>(`/api/v1/admin/tickets/${ticketId}/messages`, {
						method: "POST",
						body: JSON.stringify(request),
					});
				},
			},

			errorReports: {
				list: async (params?: { page?: number; pageSize?: number }) => {
					const searchParams = new URLSearchParams();
					if (params?.page) searchParams.set("page", String(params.page));
					if (params?.pageSize) searchParams.set("page_size", String(params.pageSize));

					const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
					return authFetch<ErrorReportListResponse>(`/api/v1/admin/error-reports${query}`);
				},

				get: async (id: string) => {
					return authFetch<ErrorReport>(`/api/v1/admin/error-reports/${id}`);
				},

				delete: async (id: string) => {
					return authFetch<{ message: string }>(`/api/v1/admin/error-reports/${id}`, {
						method: "DELETE",
					});
				},

				bulkDelete: async (ids: string[]) => {
					return authFetch<{ message: string; count: number }>("/api/v1/admin/error-reports/bulk-delete", {
						method: "POST",
						body: JSON.stringify({ ids }),
					});
				},
			},
		},
	};
}

export { SupportApiError };
