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
	FlaggedRequest,
	FlaggedRequestListResponse,
	FlaggedRequestStats,
	ReviewFlaggedRequestRequest,
} from "@/types/support";
import { getTenantId } from "@/lib/tenant";
import { createServiceFetch, ApiError, type FetchOptions } from "./fetch-with-retry";

const SUPPORT_API_URL = process.env.NEXT_PUBLIC_SUPPORT_API_URL || "";
const serviceFetch = createServiceFetch(SUPPORT_API_URL);

class SupportApiError extends ApiError {
	constructor(status: number, message: string, code?: string) {
		super(status, message, code);
		this.name = "SupportApiError";
	}
}

export async function submitErrorReport(
	request: CreateErrorReportRequest,
	accessToken?: string | null
): Promise<ErrorReport> {
	const tenantId = getTenantId();

	try {
		return await serviceFetch<ErrorReport>("/api/v1/error-reports", {
			method: "POST",
			body: JSON.stringify(request),
			accessToken: accessToken || undefined,
			tenantId: tenantId || undefined,
		});
	} catch (error) {
		if (error instanceof ApiError) {
			throw new SupportApiError(error.status, error.message, error.code);
		}
		throw error;
	}
}

async function fetchSupportApiWithAuth<T>(
	endpoint: string,
	accessToken: string | null,
	options?: FetchOptions
): Promise<T> {
	const tenantId = getTenantId();

	try {
		return await serviceFetch<T>(endpoint, {
			...options,
			accessToken: accessToken || undefined,
			tenantId: tenantId || undefined,
		});
	} catch (error) {
		if (error instanceof ApiError) {
			throw new SupportApiError(error.status, error.message, error.code);
		}
		throw error;
	}
}

export function createSupportApiClient(accessToken: string | null) {
	const authFetch = <T>(endpoint: string, options?: FetchOptions) => {
		if (!accessToken) {
			throw new SupportApiError(401, "Not authenticated");
		}
		return fetchSupportApiWithAuth<T>(endpoint, accessToken, options);
	};

	return {
		tickets: {
			getMyTickets: async (params?: { status?: string; offset?: number; limit?: number }) => {
				const searchParams = new URLSearchParams();
				if (params?.status) searchParams.set("status", params.status);
				if (params?.offset !== undefined) searchParams.set("offset", String(params.offset));
				if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));

				const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
				return authFetch<TicketListResponse>(`/api/v1/my-tickets${query}`);
			},

			list: async (params?: {
				status?: string;
				priority?: string;
				category?: string;
				offset?: number;
				limit?: number;
			}) => {
				const searchParams = new URLSearchParams();
				if (params?.status) searchParams.set("status", params.status);
				if (params?.priority) searchParams.set("priority", params.priority);
				if (params?.category) searchParams.set("category", params.category);
				if (params?.offset !== undefined) searchParams.set("offset", String(params.offset));
				if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));

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
					offset?: number;
					limit?: number;
				}) => {
					const searchParams = new URLSearchParams();
					if (params?.status) searchParams.set("status", params.status);
					if (params?.priority) searchParams.set("priority", params.priority);
					if (params?.category) searchParams.set("category", params.category);
					if (params?.offset !== undefined) searchParams.set("offset", String(params.offset));
					if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));

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
				list: async (params?: { offset?: number; limit?: number }) => {
					const searchParams = new URLSearchParams();
					if (params?.offset !== undefined) searchParams.set("offset", String(params.offset));
					if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));

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

			flaggedRequests: {
				list: async (params?: { status?: string; severity?: string; offset?: number; limit?: number }) => {
					const searchParams = new URLSearchParams();
					if (params?.status) searchParams.set("status", params.status);
					if (params?.severity) searchParams.set("severity", params.severity);
					if (params?.offset !== undefined) searchParams.set("offset", String(params.offset));
					if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));

					const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
					return authFetch<FlaggedRequestListResponse>(`/api/v1/admin/flagged-requests${query}`);
				},

				getStats: async () => {
					return authFetch<FlaggedRequestStats>("/api/v1/admin/flagged-requests/stats");
				},

				get: async (id: string) => {
					return authFetch<FlaggedRequest>(`/api/v1/admin/flagged-requests/${id}`);
				},

				review: async (id: string, request: ReviewFlaggedRequestRequest) => {
					return authFetch<FlaggedRequest>(`/api/v1/admin/flagged-requests/${id}/review`, {
						method: "PUT",
						body: JSON.stringify(request),
					});
				},

				delete: async (id: string) => {
					return authFetch<{ message: string }>(`/api/v1/admin/flagged-requests/${id}`, {
						method: "DELETE",
					});
				},
			},
		},
	};
}

export { SupportApiError };
