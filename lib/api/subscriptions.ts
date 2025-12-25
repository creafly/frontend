import type {
	Plan,
	Subscription,
	SubscribeRequest,
	ChangePlanRequest,
	CheckCanGenerateResponse,
	TokenUsageSummary,
	TokenUsageLogList,
} from "@/types";
import { createServiceFetch, ApiError, type FetchOptions } from "./fetch-with-retry";

const SUBSCRIPTIONS_API_URL = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_URL || "http://localhost:8082";
const serviceFetch = createServiceFetch(SUBSCRIPTIONS_API_URL);

class SubscriptionsApiError extends ApiError {
	constructor(status: number, message: string, code?: string) {
		super(status, message, code);
		this.name = "SubscriptionsApiError";
	}
}

async function fetchSubscriptionsApi<T>(
	endpoint: string,
	options?: FetchOptions
): Promise<T> {
	try {
		return await serviceFetch<T>(endpoint, options);
	} catch (error) {
		if (error instanceof ApiError) {
			throw new SubscriptionsApiError(error.status, error.message, error.code);
		}
		throw error;
	}
}

async function fetchWithAuth<T>(
	endpoint: string,
	accessToken: string,
	tenantId?: string,
	options?: FetchOptions
): Promise<T> {
	try {
		return await serviceFetch<T>(endpoint, {
			...options,
			accessToken,
			tenantId,
		});
	} catch (error) {
		if (error instanceof ApiError) {
			throw new SubscriptionsApiError(error.status, error.message, error.code);
		}
		throw error;
	}
}

export const subscriptionsApi = {
	getActivePlans: async () => {
		return fetchSubscriptionsApi<Plan[]>("/api/v1/plans", {
			method: "GET",
			skipContentType: true,
		});
	},

	getPlanById: async (planId: string) => {
		return fetchSubscriptionsApi<Plan>(`/api/v1/plans/${planId}`, {
			method: "GET",
			skipContentType: true,
		});
	},

	getAllPlans: async (accessToken: string) => {
		return fetchWithAuth<Plan[]>("/api/v1/admin/plans", accessToken, undefined, {
			method: "GET",
			skipContentType: true,
		});
	},

	createPlan: async (accessToken: string, plan: Omit<Plan, "id" | "createdAt" | "updatedAt">) => {
		return fetchWithAuth<Plan>("/api/v1/admin/plans", accessToken, undefined, {
			method: "POST",
			body: JSON.stringify(plan),
		});
	},

	updatePlan: async (
		accessToken: string,
		planId: string,
		plan: Partial<Omit<Plan, "id" | "createdAt" | "updatedAt">>
	) => {
		return fetchWithAuth<Plan>(`/api/v1/admin/plans/${planId}`, accessToken, undefined, {
			method: "PUT",
			body: JSON.stringify(plan),
		});
	},

	deletePlan: async (accessToken: string, planId: string) => {
		return fetchWithAuth<{ message?: string; error?: string }>(
			`/api/v1/admin/plans/${planId}`,
			accessToken,
			undefined,
			{
				method: "DELETE",
				skipContentType: true,
			}
		);
	},

	subscribe: async (accessToken: string, tenantId: string, request: SubscribeRequest) => {
		return fetchWithAuth<Subscription>("/api/v1/subscription", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify(request),
		});
	},

	getCurrentSubscription: async (accessToken: string, tenantId: string) => {
		try {
			return await fetchWithAuth<Subscription>("/api/v1/subscription", accessToken, tenantId, {
				method: "GET",
				skipContentType: true,
			});
		} catch (error) {
			if (error instanceof SubscriptionsApiError && error.status === 404) {
				return null;
			}
			throw error;
		}
	},

	changePlan: async (accessToken: string, tenantId: string, request: ChangePlanRequest) => {
		return fetchWithAuth<Subscription>("/api/v1/subscription/plan", accessToken, tenantId, {
			method: "PUT",
			body: JSON.stringify(request),
		});
	},

	cancelSubscription: async (accessToken: string, tenantId: string) => {
		return fetchWithAuth<Subscription>("/api/v1/subscription", accessToken, tenantId, {
			method: "DELETE",
			skipContentType: true,
		});
	},

	checkCanGenerate: async (accessToken: string, tenantId: string) => {
		return fetchWithAuth<CheckCanGenerateResponse>(
			"/api/v1/subscription/check",
			accessToken,
			tenantId,
			{
				method: "GET",
				skipContentType: true,
			}
		);
	},

	getUsageSummary: async (accessToken: string, tenantId: string, year?: number, month?: number) => {
		const params = new URLSearchParams();
		if (year !== undefined) params.append("year", year.toString());
		if (month !== undefined) params.append("month", month.toString());
		const queryString = params.toString() ? `?${params.toString()}` : "";

		return fetchWithAuth<TokenUsageSummary>(
			`/api/v1/usage${queryString}`,
			accessToken,
			tenantId,
			{
				method: "GET",
				skipContentType: true,
			}
		);
	},

	getUsageLogs: async (accessToken: string, tenantId: string, limit: number = 10, offset: number = 0) => {
		const params = new URLSearchParams();
		params.append("limit", limit.toString());
		params.append("offset", offset.toString());

		return fetchWithAuth<TokenUsageLogList>(
			`/api/v1/usage/logs?${params.toString()}`,
			accessToken,
			tenantId,
			{
				method: "GET",
				skipContentType: true,
			}
		);
	},

	startTrial: async (accessToken: string, tenantId: string, planId: string) => {
		return fetchWithAuth<Subscription>("/api/v1/subscription", accessToken, tenantId, {
			method: "POST",
			body: JSON.stringify({ planId, billingCycle: "monthly" }),
		});
	},

	checkTrialEligibility: async (accessToken: string, tenantId: string) => {
		return fetchWithAuth<{ eligible: boolean; reason?: string }>(
			"/api/v1/subscription/trial/check",
			accessToken,
			tenantId,
			{
				method: "GET",
				skipContentType: true,
			}
		);
	},

	getAnalytics: async (accessToken: string) => {
		return fetchWithAuth<{
			subscriptions: {
				totalSubscriptions: number;
				activeSubscriptions: number;
				trialSubscriptions: number;
				canceledThisMonth: number;
				newThisMonth: number;
				mrr: number;
				averageCheck: number;
			};
			planDistribution: Array<{
				planId: string;
				planName: string;
				count: number;
			}>;
		}>("/api/v1/admin/analytics", accessToken, undefined, {
			method: "GET",
			skipContentType: true,
		});
	},
};

export { SubscriptionsApiError };
