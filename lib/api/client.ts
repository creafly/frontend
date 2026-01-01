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
	EmailRefineRequest,
	EmailRefineResponse,
} from "@/types";
import { useAuth } from "@/providers/auth-provider";
import { getTenantId } from "@/lib/tenant";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
		public code?: string,
		public subscriptionStatus?: string
	) {
		super(message);
		this.name = "ApiError";
	}
}

async function fetchApiWithAuth<T>(
	endpoint: string,
	accessToken: string | null,
	options?: RequestInit & { skipContentType?: boolean }
): Promise<T> {
	if (!accessToken) {
		throw new ApiError(401, "Not authenticated");
	}

	const url = `${API_BASE_URL}${endpoint}`;
	const { skipContentType, ...fetchOptions } = options || {};

	const headers: HeadersInit = {
		...fetchOptions?.headers,
		Authorization: `Bearer ${accessToken}`,
	};

	if (!skipContentType && fetchOptions?.body) {
		(headers as Record<string, string>)["Content-Type"] = "application/json";
	}

	const response = await fetch(url, {
		...fetchOptions,
		headers,
	});

	const data = await response.json();

	if (!response.ok) {
		throw new ApiError(
			response.status,
			data.error || "An error occurred",
			data.code,
			data.subscriptionStatus
		);
	}

	return data;
}

function createApiClient(accessToken: string | null) {
	const authFetch = <T>(
		endpoint: string,
		options?: RequestInit & { skipContentType?: boolean }
	) => {
		if (!accessToken) {
			throw new ApiError(401, "Not authenticated");
		}
		return fetchApiWithAuth<T>(endpoint, accessToken, options);
	};

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
				return authFetch<TemplateListResponse>(`/v1/templates/${tenantId}${query}`);
			},

			get: async (id: string) => {
				const tenantId = getTenantId();
				if (!tenantId) {
					throw new Error("No tenant selected");
				}
				return authFetch<TemplateSingleResponse>(`/v1/templates/${tenantId}/${id}`);
			},

			create: async (input: CreateTemplateInput) => {
				const tenantId = getTenantId();
				if (!tenantId) {
					throw new Error("No tenant selected");
				}
				return authFetch<TemplateSingleResponse>("/v1/templates", {
					method: "POST",
					body: JSON.stringify(input),
				});
			},

			update: async (id: string, input: UpdateTemplateInput) => {
				const tenantId = getTenantId();
				if (!tenantId) {
					throw new Error("No tenant selected");
				}
				return authFetch<TemplateSingleResponse>(`/v1/templates/${tenantId}/${id}`, {
					method: "PUT",
					body: JSON.stringify(input),
				});
			},

			delete: async (id: string) => {
				const tenantId = getTenantId();
				if (!tenantId) {
					throw new Error("No tenant selected");
				}
				return authFetch<{ ok: boolean }>(`/v1/templates/${tenantId}/${id}`, {
					method: "DELETE",
					skipContentType: true,
				});
			},

			duplicate: async (id: string, newName?: string) => {
				const tenantId = getTenantId();
				if (!tenantId) {
					throw new Error("No tenant selected");
				}
				return authFetch<TemplateSingleResponse>(`/v1/templates/${tenantId}/${id}/duplicate`, {
					method: "POST",
					body: JSON.stringify({ newName }),
				});
			},
		},

		blocksApi: {
			list: async () => {
				return authFetch<BlockListResponse>("/v1/blocks");
			},
		},

		fontsApi: {
			list: async () => {
				return authFetch<FontsListResponse>("/v1/fonts");
			},
		},

		contentAgentApi: {
			generate: async (request: EmailGenerateRequest) => {
				return authFetch<EmailGenerateResponse>("/v1/agents/content-agent/generate", {
					method: "POST",
					body: JSON.stringify(request),
				});
			},

			preview: async (request: EmailGenerateRequest) => {
				return authFetch<EmailPreviewResponse>("/v1/agents/content-agent/preview", {
					method: "POST",
					body: JSON.stringify(request),
				});
			},

			invoke: async (request: EmailGenerateRequest) => {
				return authFetch<EmailJsonResponse>("/v1/agents/content-agent/invoke", {
					method: "POST",
					body: JSON.stringify(request),
				});
			},

			refine: async (request: EmailRefineRequest) => {
				return authFetch<EmailRefineResponse>("/v1/agents/content-agent/refine", {
					method: "POST",
					body: JSON.stringify(request),
				});
			},
		},

		emailApi: {
			generate: async (request: EmailGenerateRequest) => {
				return authFetch<EmailGenerateResponse>("/v1/email/generate", {
					method: "POST",
					body: JSON.stringify(request),
				});
			},

			preview: async (request: EmailGenerateRequest) => {
				return authFetch<EmailPreviewResponse>("/v1/email/preview", {
					method: "POST",
					body: JSON.stringify(request),
				});
			},

			json: async (request: EmailGenerateRequest) => {
				return authFetch<EmailJsonResponse>("/v1/email/json", {
					method: "POST",
					body: JSON.stringify(request),
				});
			},

			refine: async (request: EmailRefineRequest) => {
				return authFetch<EmailRefineResponse>("/v1/email/refine", {
					method: "POST",
					body: JSON.stringify(request),
				});
			},
		},

		templateTypesApi: {
			list: async () => {
				return authFetch<TemplateTypeListResponse>("/v1/template-types");
			},

			getSampleBlocks: async (type: string, subject?: string) => {
				const params = new URLSearchParams();
				if (subject) params.set("subject", subject);
				const query = params.toString() ? `?${params.toString()}` : "";
				return authFetch<SampleBlocksResponse>(`/v1/template-types/${type}/sample-blocks${query}`);
			},
		},
	};
}

export function useApiClient() {
	const { tokens } = useAuth();
	return createApiClient(tokens?.accessToken || null);
}

export { ApiError };
