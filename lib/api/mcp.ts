import type {
	MCPInstance,
	MCPInstanceList,
	MCPServer,
	CreateInstanceRequest,
	ExtendInstanceRequest,
} from "@/types/mcp";
import { createServiceFetch, ApiError, type FetchOptions } from "./fetch-with-retry";

const MCP_API_URL = process.env.NEXT_PUBLIC_MCP_URL || "http://localhost:8087";

const serviceFetch = createServiceFetch(MCP_API_URL);

class MCPApiError extends ApiError {
	constructor(status: number, message: string) {
		super(status, message);
		this.name = "MCPApiError";
	}
}

async function fetchMCPApi<T>(
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

export const mcpApi = {
	getServers: async (accessToken: string, tenantId: string) => {
		return fetchMCPApi<MCPServer[]>("/api/v1/servers", accessToken, tenantId);
	},

	getServer: async (accessToken: string, tenantId: string, serverName: string) => {
		return fetchMCPApi<MCPServer>(
			`/api/v1/servers/${encodeURIComponent(serverName)}`,
			accessToken,
			tenantId
		);
	},

	getInstances: async (
		accessToken: string,
		tenantId: string,
		params?: { limit?: number; offset?: number }
	) => {
		const searchParams = new URLSearchParams();
		if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());
		if (params?.offset !== undefined) searchParams.set("offset", params.offset.toString());
		const queryString = searchParams.toString();
		return fetchMCPApi<MCPInstanceList>(
			`/api/v1/instances${queryString ? `?${queryString}` : ""}`,
			accessToken,
			tenantId
		);
	},

	getInstance: async (accessToken: string, tenantId: string, instanceId: string) => {
		return fetchMCPApi<MCPInstance>(`/api/v1/instances/${instanceId}`, accessToken, tenantId);
	},

	createInstance: async (accessToken: string, tenantId: string, request: CreateInstanceRequest) => {
		return fetchMCPApi<MCPInstance>("/api/v1/instances", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	stopInstance: async (accessToken: string, tenantId: string, instanceId: string) => {
		return fetchMCPApi<void>(`/api/v1/instances/${instanceId}/stop`, accessToken, tenantId, {
			method: "POST",
			skipContentType: true,
		});
	},

	extendInstance: async (
		accessToken: string,
		tenantId: string,
		instanceId: string,
		request: ExtendInstanceRequest
	) => {
		return fetchMCPApi<MCPInstance>(
			`/api/v1/instances/${instanceId}/extend`,
			accessToken,
			tenantId,
			{
				method: "POST",
				body: JSON.stringify(request),
			}
		);
	},

	getInstanceLogs: async (
		accessToken: string,
		tenantId: string,
		instanceId: string,
		tail: number = 100
	) => {
		return fetchMCPApi<{ logs: string }>(
			`/api/v1/instances/${instanceId}/logs?tail=${tail}`,
			accessToken,
			tenantId
		);
	},
};

export { MCPApiError };
