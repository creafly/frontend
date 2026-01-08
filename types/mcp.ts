export type InstanceStatus = "pending" | "starting" | "running" | "stopping" | "stopped" | "failed";

export type MCPProtocol = "sse" | "websocket" | "stdio";

export interface MCPInstance {
	id: string;
	tenantId: string;
	userId: string;
	serverName: string;
	containerId?: string;
	status: InstanceStatus;
	connectionUrl?: string;
	internalPort: number;
	externalPort?: number;
	errorMessage?: string;
	ttlHours: number;
	expiresAt: string;
	startedAt?: string;
	stoppedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface MCPInstanceList {
	items: MCPInstance[];
	totalCount: number;
	limit: number;
	offset: number;
}

export interface MCPSecretSpec {
	envName: string;
	displayName: string;
	description: string;
	required: boolean;
	validation?: {
		minLength?: number;
		maxLength?: number;
		pattern?: string;
		enum?: string[];
	};
}

export interface MCPEnvVarSpec {
	envName: string;
	displayName: string;
	description: string;
	type: "string" | "integer" | "boolean";
	defaultValue: string;
	validation?: {
		minLength?: number;
		maxLength?: number;
		pattern?: string;
		enum?: string[];
		min?: number;
		max?: number;
	};
}

export interface MCPResourceLimits {
	memoryMb: number;
	cpuQuota: number;
}

export interface MCPHealthCheckSpec {
	path: string;
	intervalSeconds: number;
	timeoutSeconds: number;
	retries: number;
}

export interface MCPServer {
	name: string;
	displayName: string;
	description: string;
	image: string;
	port: number;
	protocol: MCPProtocol;
	maxTtlHours: number;
	requiredSecrets: MCPSecretSpec[];
	optionalEnvVars: MCPEnvVarSpec[];
	resourceLimits: MCPResourceLimits;
	healthCheck?: MCPHealthCheckSpec;
}

export interface CreateInstanceRequest {
	serverName: string;
	ttlHours: number;
	secrets: Record<string, string>;
	envVars?: Record<string, string>;
}

export interface ExtendInstanceRequest {
	additionalHours: number;
}

export interface MCPSubscriptionLimits {
	mcpEnabled: boolean;
	maxConcurrentServers: number;
	maxTtlHours: number;
	allowedServers?: string[];
}
