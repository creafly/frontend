import type {
	CreateTemplateInput,
	UpdateTemplateInput,
	TemplateListResponse,
	TemplateSingleResponse,
	BlockListResponse,
	TemplateTypeListResponse,
	SampleBlocksResponse,
	FontsListResponse,
	EmailGenerateRequest,
	EmailGenerateResponse,
	EmailPreviewResponse,
	EmailJsonResponse,
	ConversationListResponse,
	ConversationSingleResponse,
	CreateConversationRequest,
	AddMessageRequest,
	MessageSingleResponse,
} from "@/types";
import { useAuth } from "@/providers/auth-provider";
import { getTenantId } from "@/lib/tenant";
import { createServiceFetch, ApiError, type FetchOptions } from "./fetch-with-retry";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const serviceFetch = createServiceFetch(API_BASE_URL);

const AUTH_STORAGE_KEY = "creafly_auth";

class ClientApiError extends ApiError {
	constructor(status: number, message: string, code?: string, public subscriptionStatus?: string) {
		super(status, message, code);
		this.name = "ApiError";
	}
}

async function fetchApiWithAuth<T>(
	endpoint: string,
	accessToken: string | null,
	options?: FetchOptions
): Promise<T> {
	if (!accessToken) {
		throw new ClientApiError(401, "Not authenticated");
	}

	try {
		return await serviceFetch<T>(endpoint, {
			...options,
			accessToken,
		});
	} catch (error) {
		if (error instanceof ApiError) {
			const data = error.data as { subscriptionStatus?: string } | undefined;
			throw new ClientApiError(error.status, error.message, error.code, data?.subscriptionStatus);
		}
		throw error;
	}
}

function createApiClient(
	authFetch: <T>(endpoint: string, options?: FetchOptions) => Promise<T>
) {
	return {
		templatesApi: {
			list: async (options?: {
				isActive?: boolean;
				templateType?: string;
				offset?: number;
				limit?: number;
			}) => {
				const tenantId = getTenantId();
				if (!tenantId) {
					throw new Error("No tenant selected");
				}
				const params = new URLSearchParams();
				if (options?.isActive !== undefined) params.set("isActive", String(options.isActive));
				if (options?.templateType) params.set("templateType", options.templateType);
				if (options?.offset !== undefined) params.set("offset", String(options.offset));
				if (options?.limit !== undefined) params.set("limit", String(options.limit));

				const query = params.toString() ? `?${params.toString()}` : "";
				return authFetch<TemplateListResponse>(`/api/v1/templates/${tenantId}${query}`);
			},

			get: async (id: string) => {
				const tenantId = getTenantId();
				if (!tenantId) {
					throw new Error("No tenant selected");
				}
				return authFetch<TemplateSingleResponse>(`/api/v1/templates/${tenantId}/${id}`);
			},

			create: async (input: CreateTemplateInput) => {
				const tenantId = getTenantId();
				if (!tenantId) {
					throw new Error("No tenant selected");
				}
				return authFetch<TemplateSingleResponse>("/api/v1/templates", {
					method: "POST",
					body: JSON.stringify(input),
				});
			},

			update: async (id: string, input: UpdateTemplateInput) => {
				const tenantId = getTenantId();
				if (!tenantId) {
					throw new Error("No tenant selected");
				}
				return authFetch<TemplateSingleResponse>(`/api/v1/templates/${tenantId}/${id}`, {
					method: "PUT",
					body: JSON.stringify(input),
				});
			},

			delete: async (id: string) => {
				const tenantId = getTenantId();
				if (!tenantId) {
					throw new Error("No tenant selected");
				}
				return authFetch<{ ok: boolean }>(`/api/v1/templates/${tenantId}/${id}`, {
					method: "DELETE",
					skipContentType: true,
				});
			},

			duplicate: async (id: string, newName?: string) => {
				const tenantId = getTenantId();
				if (!tenantId) {
					throw new Error("No tenant selected");
				}
				return authFetch<TemplateSingleResponse>(`/api/v1/templates/${tenantId}/${id}/duplicate`, {
					method: "POST",
					body: JSON.stringify({ newName }),
				});
			},
		},

		blocksApi: {
			list: async () => {
				return authFetch<BlockListResponse>("/api/v1/blocks");
			},
		},

		fontsApi: {
			list: async () => {
				return authFetch<FontsListResponse>("/api/v1/fonts");
			},
		},

		contentAgentApi: {
			generate: async (request: EmailGenerateRequest) => {
				return authFetch<EmailGenerateResponse>("/api/v1/agents/content-agent/generate", {
					method: "POST",
					body: JSON.stringify(request),
				});
			},

			preview: async (request: EmailGenerateRequest) => {
				return authFetch<EmailPreviewResponse>("/api/v1/agents/content-agent/preview", {
					method: "POST",
					body: JSON.stringify(request),
				});
			},

			invoke: async (request: EmailGenerateRequest) => {
				return authFetch<EmailJsonResponse>("/api/v1/agents/content-agent/invoke", {
					method: "POST",
					body: JSON.stringify(request),
				});
			},
		},

		templateTypesApi: {
			list: async () => {
				return authFetch<TemplateTypeListResponse>("/api/v1/template-types");
			},

			getSampleBlocks: async (type: string, subject?: string) => {
				const params = new URLSearchParams();
				if (subject) params.set("subject", subject);
				const query = params.toString() ? `?${params.toString()}` : "";
				return authFetch<SampleBlocksResponse>(
					`/api/v1/template-types/${type}/sample-blocks${query}`
				);
			},
		},

		conversationsApi: {
			list: async (tenantId: string, options?: { offset?: number; limit?: number }) => {
				const params = new URLSearchParams();
				if (options?.offset !== undefined) params.set("offset", String(options.offset));
				if (options?.limit !== undefined) params.set("limit", String(options.limit));
				const query = params.toString() ? `?${params.toString()}` : "";
				return authFetch<ConversationListResponse>(`/api/v1/conversations/${tenantId}${query}`);
			},

			get: async (tenantId: string, id: string) => {
				return authFetch<ConversationSingleResponse>(`/api/v1/conversations/${tenantId}/${id}`);
			},

			create: async (input: CreateConversationRequest) => {
				return authFetch<{
					conversation: {
						id: string;
						tenantId: string;
						userId: string;
						title: string | null;
						createdAt: string;
						updatedAt: string;
					};
				}>("/api/v1/conversations", {
					method: "POST",
					body: JSON.stringify(input),
				});
			},

			update: async (tenantId: string, id: string, title: string) => {
				return authFetch<{
					conversation: {
						id: string;
						tenantId: string;
						userId: string;
						title: string | null;
						createdAt: string;
						updatedAt: string;
					};
				}>(`/api/v1/conversations/${tenantId}/${id}`, {
					method: "PUT",
					body: JSON.stringify({ title }),
				});
			},

			delete: async (tenantId: string, id: string) => {
				return authFetch<{ message: string }>(`/api/v1/conversations/${tenantId}/${id}`, {
					method: "DELETE",
					skipContentType: true,
				});
			},

			addMessage: async (tenantId: string, conversationId: string, message: AddMessageRequest) => {
				return authFetch<MessageSingleResponse>(
					`/api/v1/conversations/${tenantId}/${conversationId}/messages`,
					{
						method: "POST",
						body: JSON.stringify(message),
					}
				);
			},
		},
	};
}

export function useApiClient() {
	const { tokens, refreshTokens, logout } = useAuth();
	const accessToken = tokens?.accessToken || null;

	const authFetch = async <T>(
		endpoint: string,
		options?: FetchOptions
	): Promise<T> => {
		if (!accessToken) {
			throw new ClientApiError(401, "Not authenticated");
		}

		try {
			return await fetchApiWithAuth<T>(endpoint, accessToken, options);
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				const refreshed = await refreshTokens();
				if (refreshed) {
					const stored = typeof window !== "undefined" 
						? JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null") 
						: null;
					const newToken = stored?.tokens?.accessToken;
					if (newToken) {
						return await fetchApiWithAuth<T>(endpoint, newToken, options);
					}
				}
				logout();
			}
			throw error;
		}
	};

	return createApiClient(authFetch);
}

export { ClientApiError as ApiError };
