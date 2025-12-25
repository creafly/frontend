export interface ServiceHealth {
	status: "ok" | "error";
	service: string;
}

export interface ServiceStatus {
	name: string;
	displayName: string;
	status: "operational" | "degraded" | "down";
	responseTime: number | null;
	lastChecked: Date;
	error?: string;
}

export interface SystemStatus {
	overall: "operational" | "degraded" | "down";
	services: ServiceStatus[];
	lastChecked: Date;
}

const SERVICES = [
	{
		name: "identity",
		getBaseUrl: () => process.env.NEXT_PUBLIC_IDENTITY_URL,
		healthPath: "/health",
	},
	{
		name: "storage",
		getBaseUrl: () => process.env.NEXT_PUBLIC_STORAGE_URL,
		healthPath: "/health",
	},
	{
		name: "notifications",
		getBaseUrl: () => process.env.NEXT_PUBLIC_NOTIFICATIONS_URL,
		healthPath: "/health",
	},
	{
		name: "subscriptions",
		getBaseUrl: () => process.env.NEXT_PUBLIC_SUBSCRIPTIONS_URL,
		healthPath: "/health",
	},
	{
		name: "branding",
		getBaseUrl: () => process.env.NEXT_PUBLIC_BRANDING_URL,
		healthPath: "/health",
	},
	{
		name: "support",
		getBaseUrl: () => process.env.NEXT_PUBLIC_SUPPORT_API_URL,
		healthPath: "/health",
	},
	{
		name: "agent",
		getBaseUrl: () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, ""),
		healthPath: "/health",
	},
] as const;

export type ServiceName = (typeof SERVICES)[number]["name"];

async function checkServiceHealth(
	serviceName: string,
	baseUrl: string | undefined,
	healthPath: string
): Promise<ServiceStatus> {
	const startTime = performance.now();
	const now = new Date();

	if (!baseUrl) {
		return {
			name: serviceName,
			displayName: serviceName,
			status: "down",
			responseTime: null,
			lastChecked: now,
			error: "Service URL not configured",
		};
	}

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);

		const url = `${baseUrl}${healthPath}`;
		const response = await fetch(url, {
			method: "GET",
			signal: controller.signal,
			cache: "no-store",
		});

		clearTimeout(timeoutId);
		const endTime = performance.now();
		const responseTime = Math.round(endTime - startTime);

		if (response.ok) {
			const data: ServiceHealth = await response.json();
			return {
				name: serviceName,
				displayName: serviceName,
				status: data.status === "ok" ? "operational" : "degraded",
				responseTime,
				lastChecked: now,
			};
		}

		return {
			name: serviceName,
			displayName: serviceName,
			status: "degraded",
			responseTime,
			lastChecked: now,
			error: `HTTP ${response.status}`,
		};
	} catch (error) {
		const endTime = performance.now();
		const responseTime = Math.round(endTime - startTime);

		return {
			name: serviceName,
			displayName: serviceName,
			status: "down",
			responseTime: responseTime > 5000 ? null : responseTime,
			lastChecked: now,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function checkAllServicesHealth(): Promise<SystemStatus> {
	const results = await Promise.all(
		SERVICES.map((service) =>
			checkServiceHealth(service.name, service.getBaseUrl(), service.healthPath)
		)
	);

	const now = new Date();
	const downCount = results.filter((s) => s.status === "down").length;
	const degradedCount = results.filter((s) => s.status === "degraded").length;

	let overall: SystemStatus["overall"] = "operational";
	if (downCount > 0) {
		overall = downCount === results.length ? "down" : "degraded";
	} else if (degradedCount > 0) {
		overall = "degraded";
	}

	return {
		overall,
		services: results,
		lastChecked: now,
	};
}

export async function checkSingleServiceHealth(serviceName: ServiceName): Promise<ServiceStatus> {
	const service = SERVICES.find((s) => s.name === serviceName);
	if (!service) {
		throw new Error(`Unknown service: ${serviceName}`);
	}
	return checkServiceHealth(service.name, service.getBaseUrl(), service.healthPath);
}
