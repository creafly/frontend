import type {
	Secret,
	SecretList,
	CreateSecretRequest,
	UpdateSecretRequest,
} from "@/types/secrets";
import { createServiceFetch, ApiError, type FetchOptions } from "./fetch-with-retry";

const SECRETS_API_URL = process.env.NEXT_PUBLIC_SECRETS_URL || "http://localhost:8086";

const serviceFetch = createServiceFetch(SECRETS_API_URL);

class SecretsApiError extends ApiError {
	constructor(status: number, message: string) {
		super(status, message);
		this.name = "SecretsApiError";
	}
}

async function fetchSecretsApi<T>(
	endpoint: string,
	accessToken: string,
	tenantId: string,
	options?: FetchOptions
): Promise<T> {
	return serviceFetch<T>(endpoint, {
		...options,
		accessToken,
		tenantId,
	});
}

export const secretsApi = {
	getSecrets: async (
		accessToken: string,
		tenantId: string,
		params?: { limit?: number; offset?: number; search?: string }
	) => {
		const searchParams = new URLSearchParams();
		if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());
		if (params?.offset !== undefined) searchParams.set("offset", params.offset.toString());
		if (params?.search) searchParams.set("search", params.search);
		const queryString = searchParams.toString();
		return fetchSecretsApi<SecretList>(
			`/api/v1/secrets${queryString ? `?${queryString}` : ""}`,
			accessToken,
			tenantId
		);
	},

	getSecret: async (accessToken: string, tenantId: string, secretId: string) => {
		return fetchSecretsApi<Secret>(`/api/v1/secrets/${secretId}`, accessToken, tenantId);
	},

	getSecretByName: async (accessToken: string, tenantId: string, name: string) => {
		return fetchSecretsApi<Secret>(`/api/v1/secrets/name/${encodeURIComponent(name)}`, accessToken, tenantId);
	},

	createSecret: async (accessToken: string, tenantId: string, request: CreateSecretRequest) => {
		return fetchSecretsApi<Secret>("/api/v1/secrets", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	updateSecret: async (
		accessToken: string,
		tenantId: string,
		secretId: string,
		request: UpdateSecretRequest
	) => {
		return fetchSecretsApi<Secret>(`/api/v1/secrets/${secretId}`, accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	deleteSecret: async (accessToken: string, tenantId: string, secretId: string) => {
		return fetchSecretsApi<void>(`/api/v1/secrets/${secretId}`, accessToken, tenantId, {
			method: "DELETE",
			skipContentType: true,
		});
	},
};

export { SecretsApiError };
