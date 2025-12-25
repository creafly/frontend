import type { JobResponse, CreateGenerateJobRequest, CreateRefineJobRequest } from "@/types";
import { createServiceFetch, ApiError, type FetchOptions } from "./fetch-with-retry";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const serviceFetch = createServiceFetch(API_BASE_URL);

class JobsApiError extends ApiError {
	constructor(status: number, message: string, code?: string, public subscriptionStatus?: string) {
		super(status, message, code);
		this.name = "JobsApiError";
	}
}

async function fetchWithAuth<T>(
	endpoint: string,
	accessToken: string | null,
	options?: FetchOptions
): Promise<T> {
	if (!accessToken) {
		throw new JobsApiError(401, "Not authenticated");
	}

	try {
		return await serviceFetch<T>(endpoint, {
			...options,
			accessToken,
		});
	} catch (error) {
		if (error instanceof ApiError) {
			const data = error.data as { subscriptionStatus?: string } | undefined;
			throw new JobsApiError(error.status, error.message, error.code, data?.subscriptionStatus);
		}
		throw error;
	}
}

export interface ActiveJobsResponse {
	jobs: JobResponse[];
}

export interface JobsApiClient {
	createGenerateJob(request: CreateGenerateJobRequest): Promise<JobResponse>;
	createRefineJob(request: CreateRefineJobRequest): Promise<JobResponse>;
	getJob(jobId: string): Promise<JobResponse>;
	cancelJob(jobId: string): Promise<JobResponse>;
	getActiveJobs(tenantId?: string): Promise<ActiveJobsResponse>;
	getStreamUrl(jobId: string): string;
}

export function createJobsApiClient(accessToken: string | null): JobsApiClient {
	const authFetch = <T>(endpoint: string, options?: FetchOptions) => {
		return fetchWithAuth<T>(endpoint, accessToken, options);
	};

	return {
		createGenerateJob: async (request: CreateGenerateJobRequest) => {
			return authFetch<JobResponse>("/api/v1/jobs/generate", {
				method: "POST",
				body: JSON.stringify(request),
			});
		},

		createRefineJob: async (request: CreateRefineJobRequest) => {
			return authFetch<JobResponse>("/api/v1/jobs/refine", {
				method: "POST",
				body: JSON.stringify(request),
			});
		},

		getJob: async (jobId: string) => {
			return authFetch<JobResponse>(`/api/v1/jobs/${jobId}`);
		},

		cancelJob: async (jobId: string) => {
			return authFetch<JobResponse>(`/api/v1/jobs/${jobId}/cancel`, {
				method: "POST",
			});
		},

		getActiveJobs: async (tenantId?: string) => {
			const params = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
			return authFetch<ActiveJobsResponse>(`/api/v1/jobs/active${params}`);
		},

		getStreamUrl: (jobId: string) => {
			return `${API_BASE_URL}/api/v1/jobs/${jobId}/stream`;
		},
	};
}

export { JobsApiError };
